import { Cart, Product } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

/** فیلدهایی که برای نمایش سبد لازم است؛ توضیحات بلند را نمی‌کشیم. */
const ITEM_FIELDS = 'name slug price discount stock unit weight images isActive';

/**
 * مالک سبد: کاربر لاگین‌کرده، وگرنه شناسه مهمان از هدر.
 * هدر X-Guest-Id توسط کلاینت روی همه درخواست‌ها ست می‌شود.
 */
export function cartOwner(req) {
  if (req.user?._id) return { user: req.user._id };
  const guestId = req.get('X-Guest-Id') || req.body?.guestId;
  if (!guestId) throw ApiError.badRequest('شناسه سبد خرید یافت نشد');
  return { guestId: String(guestId).slice(0, 64) };
}

/**
 * سبد را پیدا یا می‌سازد. اگر کاربر تازه لاگین کرده و سبد مهمان دارد،
 * اقلام مهمان به سبد کاربر منتقل می‌شود تا خرید نیمه‌کاره از دست نرود.
 */
export async function getOrCreateCart(owner, req) {
  let cart = await Cart.findOne(owner);

  if (owner.user) {
    const guestId = req?.get?.('X-Guest-Id');
    if (guestId) {
      const guestCart = await Cart.findOne({ guestId });
      if (guestCart?.items.length) {
        cart = cart || await Cart.create({ user: owner.user, items: [] });
        for (const gi of guestCart.items) {
          const existing = cart.items.find((i) => String(i.product) === String(gi.product));
          if (existing) existing.quantity = Math.min(50, existing.quantity + gi.quantity);
          else cart.items.push({ product: gi.product, quantity: gi.quantity, priceAtAdd: gi.priceAtAdd });
        }
        await cart.save();
        await guestCart.deleteOne();
        return cart;
      }
    }
  }

  if (!cart) cart = await Cart.create({ ...owner, items: [] });
  return cart;
}

/**
 * بررسی می‌کند محصول قابل خرید است و موجودی کافی دارد.
 * قیمت هرگز از کلاینت خوانده نمی‌شود؛ همیشه سند محصول برگردانده می‌شود.
 */
export async function assertPurchasable(productId, quantity = 1) {
  const product = await Product.findById(productId).select(`${ITEM_FIELDS} discount price`);
  if (!product || !product.isActive) throw ApiError.notFound('محصول پیدا نشد یا غیرفعال است');
  if (product.stock <= 0) throw ApiError.badRequest(`«${product.name}» موجود نیست`);
  if (quantity > product.stock) {
    throw ApiError.badRequest(`از «${product.name}» تنها ${product.stock} عدد در انبار موجود است`);
  }
  return product;
}

/**
 * ساخت payload نهایی سبد برای کلاینت.
 * تمام مبالغ اینجا و از روی قیمت فعلی محصول محاسبه می‌شود، نه priceAtAdd،
 * تا دست‌کاری سمت کلاینت بی‌اثر باشد. priceAtAdd فقط برای نشان دادن
 * «قیمت تغییر کرده» استفاده می‌شود.
 *
 * یک populate، بدون N+1: اقلام حذف/غیرفعال‌شده به‌صورت خودکار از سبد پاک می‌شوند.
 */
export async function buildCartPayload(cart) {
  await cart.populate({ path: 'items.product', select: ITEM_FIELDS });

  const stale = [];
  const items = [];
  let grossSubtotal = 0;
  let subtotal = 0;

  for (const item of cart.items) {
    const p = item.product;

    // محصول حذف یا غیرفعال شده: از سبد بیرون می‌رود
    if (!p || !p.isActive) {
      stale.push(item._id);
      continue;
    }

    // موجودی کم شده: تعداد را تا سقف موجودی می‌آوریم
    const quantity = Math.max(0, Math.min(item.quantity, p.stock));
    if (quantity === 0) {
      stale.push(item._id);
      continue;
    }
    if (quantity !== item.quantity) item.quantity = quantity;

    const unitPrice = p.finalPrice();
    const lineTotal = unitPrice * quantity;
    const listTotal = p.price * quantity;

    grossSubtotal += listTotal;
    subtotal += lineTotal;

    items.push({
      _id: item._id,
      quantity,
      unitPrice,
      lineTotal,
      listPrice: p.price,
      discountPercent: p.discount || 0,
      // قیمت از زمان افزودن تغییر کرده؟ فقط یک نشانه نمایشی است
      priceChanged: Boolean(item.priceAtAdd) && item.priceAtAdd !== unitPrice,
      priceAtAdd: item.priceAtAdd,
      product: {
        _id: p._id,
        name: p.name,
        slug: p.slug,
        image: p.images?.[0]?.url || '',
        stock: p.stock,
        unit: p.unit,
        weight: p.weight,
      },
    });
  }

  // پاکسازی اقلام بی‌اعتبار، فقط وقتی واقعاً چیزی عوض شده
  if (stale.length) {
    cart.items = cart.items.filter((i) => !stale.some((id) => String(id) === String(i._id)));
  }
  if (stale.length || cart.isModified('items')) await cart.save();

  const discount = grossSubtotal - subtotal;
  const freeShippingThreshold = env.shipping.freeThreshold;
  const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const shippingCost = items.length === 0 || subtotal >= freeShippingThreshold ? 0 : env.shipping.flat;

  return {
    _id: cart._id,
    items,
    itemsCount,
    grossSubtotal,
    subtotal,
    discount,
    shippingCost,
    total: subtotal + shippingCost,
    freeShippingThreshold,
    removedCount: stale.length,
  };
}
