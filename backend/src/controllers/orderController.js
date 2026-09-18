import { Cart, Order, Product, User } from '../models/index.js';
import { STATUS_FLOW, ORDER_STATUS } from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/response.js';
import { getPaging, meta } from '../utils/pagination.js';
import ApiError from '../utils/ApiError.js';
import { buildCartPayload, cartOwner, getOrCreateCart } from '../services/cartService.js';
import { getPaymentProvider } from '../services/paymentService.js';

export const listOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaging(req.query, { defaultLimit: 20 });
  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.search) {
    const term = String(req.query.search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.orderNumber = new RegExp(term, 'i');
  }
  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name phone email').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  // هر سفارش، گام‌های بعدی مجاز و status object کوچک
  const ordersWithNext = orders.map((o) => ({
    ...o,
    nextStatuses: STATUS_FLOW[o.orderStatus] || [],
  }));
  return ok(res, { orders: ordersWithNext, meta: meta(total, page, limit) }, 'همه سفارش‌ها');
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('سفارش پیدا نشد');
  const next = req.body.orderStatus;
  if (!STATUS_FLOW[order.orderStatus].includes(next)) {
    throw ApiError.badRequest(`تغییر وضعیت از ${order.orderStatus} به ${next} مجاز نیست`);
  }
  if (next === ORDER_STATUS.CANCELLED) {
    // بازگرداندن موجودی سفارش لغوشده
    const changes = order.items.map((item) => ({
      updateOne: { filter: { _id: item.product }, update: { $inc: { stock: item.quantity } } },
    }));
    if (changes.length > 0) await Product.bulkWrite(changes);
  }
  if (next === ORDER_STATUS.DELIVERED && order.paymentMethod === 'COD') {
    order.paymentStatus = 'PAID';
  }
  order.orderStatus = next;
  order.statusHistory.push({ status: next, by: req.user._id });
  await order.save();
  return ok(res, { order: { ...order.toObject(), nextStatuses: STATUS_FLOW[next] || [] } }, 'وضعیت سفارش تغییر کرد');
});

/**
 * ثبت سفارش. نکته‌های مهم:
 *  - قیمت‌ها از سند محصول خوانده می‌شود، نه از سبد و نه از کلاینت.
 *  - موجودی به‌صورت شرطی کم می‌شود ($gte) تا دو سفارش همزمان
 *    موجودی را منفی نکنند؛ اگر شرط نگیرد، همه چیز برگردانده می‌شود.
 *  - اقلام سفارش snapshot هستند: تغییر بعدی محصول سفارش را عوض نمی‌کند.
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { addressId, shippingAddress, paymentMethod = 'COD' } = req.body;

  const cart = await getOrCreateCart(cartOwner(req), req);
  const payload = await buildCartPayload(cart);

  if (!payload.items.length) throw ApiError.badRequest('سبد خرید شما خالی است');

  // آدرس: یا از دفترچه آدرس کاربر، یا آدرس ارسالی در همین درخواست
  let address = shippingAddress;
  if (addressId) {
    const user = await User.findById(req.user._id).select('addresses');
    const saved = user?.addresses?.id?.(addressId) || user?.addresses?.find((a) => String(a._id) === String(addressId));
    if (!saved) throw ApiError.notFound('آدرس انتخاب‌شده پیدا نشد');
    address = {
      receiver: saved.receiver,
      phone: saved.phone,
      province: saved.province,
      city: saved.city,
      postalCode: saved.postalCode,
      line: saved.line,
      note: saved.note,
    };
  }
  if (!address) throw ApiError.badRequest('آدرس ارسال الزامی است');

  // درگاه را پیش از رزرو موجودی انتخاب کن؛ روش پرداخت غیرفعال نباید موجودی کم کند.
  const provider = getPaymentProvider(paymentMethod);

  // کاهش موجودی به‌صورت شرطی، یک قلم در هر بار. این کار مهم است چون
  // bulkWrite با ordered:false مشخص نمی‌کند کدام اقلام واقعاً کم شده‌اند؛
  // rollback کورکورانه می‌تواند برای قلمی که کم نشده، موجودی اضافه کند.
  const decremented = [];
  try {
    for (const item of payload.items) {
      const result = await Product.updateOne(
        { _id: item.product._id, stock: { $gte: item.quantity }, isActive: true },
        { $inc: { stock: -item.quantity, soldCount: item.quantity } },
      );
      if (result.modifiedCount !== 1) {
        throw ApiError.conflict('موجودی یکی از اقلام سبد تغییر کرد، سبد را دوباره بازبینی کنید');
      }
      decremented.push(item);
    }
  } catch (err) {
    if (decremented.length) {
      await Product.bulkWrite(decremented.map((i) => ({
        updateOne: { filter: { _id: i.product._id }, update: { $inc: { stock: i.quantity, soldCount: -i.quantity } } },
      })), { ordered: false });
    }
    throw err;
  }

  let order;
  try {
    order = await Order.create({
      user: req.user._id,
      items: payload.items.map((i) => ({
        product: i.product._id,
        name: i.product.name,
        slug: i.product.slug,
        image: i.product.images?.[0]?.url || '',
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
      })),
      shippingAddress: address,
      subtotal: payload.subtotal,
      discount: payload.discount,
      shippingCost: payload.shippingCost,
      total: payload.total,
      paymentMethod,
      statusHistory: [{ status: 'PENDING', by: req.user._id }],
    });
  } catch (err) {
    // ساخت سفارش شکست خورد: موجودی نباید سوخته بماند
    await Product.bulkWrite(decremented.map((i) => ({
      updateOne: { filter: { _id: i.product._id }, update: { $inc: { stock: i.quantity, soldCount: -i.quantity } } },
    })), { ordered: false });
    throw err;
  }

  let payment;
  try {
    payment = await provider.createPayment(order);
    if (payment?.authority) {
      order.payment = { provider: provider.name, authority: payment.authority };
      await order.save();
    }
  } catch (err) {
    // شکست ساخت پرداخت: سفارش نیمه‌کاره و رزرو موجودی باقی نماند.
    await Order.deleteOne({ _id: order._id });
    await Product.bulkWrite(decremented.map((i) => ({
      updateOne: { filter: { _id: i.product._id }, update: { $inc: { stock: i.quantity, soldCount: -i.quantity } },
      },
    })), { ordered: false });
    throw err;
  }

  // سبد بعد از سفارش موفق خالی می‌شود
  await Cart.updateOne({ _id: cart._id }, { $set: { items: [], couponCode: null } });

  return created(res, {
    order: { ...order.toObject(), nextStatuses: STATUS_FLOW[order.orderStatus] || [] },
    redirectUrl: payment?.redirectUrl || null,
  }, 'سفارش شما ثبت شد');
});

/** سفارش‌های خود کاربر، جدیدترین اول. */
export const myOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaging(req.query, { defaultLimit: 10 });
  const filter = { user: req.user._id };
  if (req.query.status) filter.orderStatus = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .select('-statusHistory -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return ok(res, {
    orders: orders.map((o) => ({ ...o, nextStatuses: STATUS_FLOW[o.orderStatus] || [] })),
    meta: meta(total, page, limit),
  }, 'سفارش‌های من');
});

/** جزئیات یک سفارش؛ فقط صاحب سفارش یا ادمین. */
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('statusHistory.by', 'name')
    .lean();
  if (!order) throw ApiError.notFound('سفارش پیدا نشد');

  const isOwner = String(order.user?._id || order.user) === String(req.user._id);
  if (!isOwner && req.user.role !== 'ADMIN') throw ApiError.forbidden();

  return ok(res, { order: { ...order, nextStatuses: STATUS_FLOW[order.orderStatus] || [] } }, 'جزئیات سفارش');
});

/**
 * لغو سفارش توسط کاربر. فقط تا قبل از ارسال ممکن است و
 * موجودی اقلام به انبار برمی‌گردد.
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('سفارش پیدا نشد');

  const isOwner = String(order.user) === String(req.user._id);
  if (!isOwner && req.user.role !== 'ADMIN') throw ApiError.forbidden();

  if (!STATUS_FLOW[order.orderStatus]?.includes(ORDER_STATUS.CANCELLED)) {
    throw ApiError.badRequest('این سفارش در وضعیت فعلی قابل لغو نیست');
  }

  const restock = order.items.map((item) => ({
    updateOne: { filter: { _id: item.product }, update: { $inc: { stock: item.quantity, soldCount: -item.quantity } } },
  }));
  if (restock.length) await Product.bulkWrite(restock, { ordered: false });

  order.orderStatus = ORDER_STATUS.CANCELLED;
  if (order.paymentStatus === 'PAID') order.paymentStatus = 'REFUNDED';
  order.statusHistory.push({ status: ORDER_STATUS.CANCELLED, by: req.user._id });
  await order.save();

  return ok(res, { order: { ...order.toObject(), nextStatuses: [] } }, 'سفارش لغو شد');
});
