import { Order, Product, Review, User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { getPaging, meta } from '../utils/pagination.js';

const PAID = { orderStatus: { $nin: ['CANCELLED'] } };
const DAY = 24 * 60 * 60 * 1000;
const TEHRAN_OFFSET = 210 * 60 * 1000;

const startOfTehranDay = (date) => {
  const local = new Date(date.getTime() + TEHRAN_OFFSET);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - TEHRAN_OFFSET);
};

/** همه تاریخ‌ها بر اساس UTC، برچسب‌ها روی کلاینت به تهران تبدیل می‌شوند. */
const bucket = (from, to) =>
  Order.aggregate([
    { $match: { ...PAID, createdAt: { $gte: from, ...(to ? { $lt: to } : {}) } } },
    { $group: { _id: null, revenue: { $sum: '$total' }, count: { $sum: 1 }, avg: { $avg: '$total' } } },
  ]);

const growth = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

const flat = (agg) => ({
  revenue: agg[0]?.revenue || 0,
  count: agg[0]?.count || 0,
  avg: Math.round(agg[0]?.avg || 0),
});

export const dashboardStats = asyncHandler(async (req, res) => {
  const days = Math.min(90, Math.max(7, Number.parseInt(req.query.days, 10) || 30));
  const now = new Date();
  const since = new Date(now.getTime() - days * DAY);
  const prevSince = new Date(now.getTime() - days * 2 * DAY);
  const todayStart = startOfTehranDay(now);

  const [
    users, newUsers, products, outOfStock, lowStockCount, orders, revenueAgg,
    currentWindow, previousWindow, todayWindow,
    statusAgg, paymentAgg, retention,
    recentOrders, lowStock, salesSeries, topProducts, topCustomers,
    recentReviews, recentUsers, weakReviews,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: since } }),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, stock: 0 }),
    Product.countDocuments({ isActive: true, stock: { $lte: 10 } }),
    Order.countDocuments(),
    Order.aggregate([{ $match: PAID }, { $group: { _id: null, total: { $sum: '$total' }, avg: { $avg: '$total' } } }]),
    bucket(since),
    bucket(prevSince, since),
    bucket(todayStart),
    Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    Order.aggregate([{ $group: { _id: '$paymentStatus', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: PAID },
      { $group: { _id: '$user', n: { $sum: 1 } } },
      { $group: { _id: null, buyers: { $sum: 1 }, repeat: { $sum: { $cond: [{ $gte: ['$n', 2] }, 1, 0] } } } },
    ]),
    Order.find()
      .populate('user', 'name phone email')
      .select('orderNumber total orderStatus paymentStatus createdAt user items')
      .sort({ createdAt: -1 }).limit(10).lean(),
    Product.find({ isActive: true, stock: { $lte: 10 } })
      .populate('category', 'name')
      .select('name slug stock price unit weight images category')
      .sort({ stock: 1 }).limit(8).lean(),
    Order.aggregate([
      { $match: { ...PAID, createdAt: { $gte: since } } },
      // مرز روزها مطابق منطقه زمانی فروشگاه است.
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Tehran' } },
        revenue: { $sum: '$total' }, count: { $sum: 1 },
      } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: PAID },
      { $unwind: '$items' },
      { $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        image: { $first: '$items.image' },
        quantity: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.lineTotal' },
      } },
      { $sort: { quantity: -1 } },
      { $limit: 6 },
    ]),
    Order.aggregate([
      { $match: PAID },
      { $group: { _id: '$user', spent: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { spent: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { spent: 1, orders: 1, name: '$user.name', email: '$user.email' } },
    ]),
    Review.find().populate('user', 'name').populate('product', 'name slug')
      .select('rating title createdAt').sort({ createdAt: -1 }).limit(6).lean(),
    User.find().select('name createdAt').sort({ createdAt: -1 }).limit(5).lean(),
    Review.countDocuments({ rating: { $lte: 3 } }),
  ]);

  const current = flat(currentWindow);
  const previous = flat(previousWindow);
  const today = flat(todayWindow);
  const buyers = retention[0]?.buyers || 0;
  const repeatBuyers = retention[0]?.repeat || 0;

  const activity = [
    ...recentOrders.slice(0, 6).map((o) => ({
      type: 'order', at: o.createdAt, id: String(o._id), title: o.orderNumber,
      actor: o.user?.name || 'مهمان', amount: o.total, status: o.orderStatus,
    })),
    ...recentReviews.map((r) => ({
      type: 'review', at: r.createdAt, id: String(r._id),
      title: r.product?.name || 'محصول حذف‌شده', actor: r.user?.name || 'کاربر', rating: r.rating,
    })),
    ...recentUsers.map((u) => ({ type: 'user', at: u.createdAt, id: String(u._id), actor: u.name })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 12);

  return ok(res, {
    range: { days, from: since, to: now },
    counters: {
      users, newUsers, products, outOfStock, lowStock: lowStockCount, orders,
      revenue: revenueAgg[0]?.total || 0,
      averageOrder: Math.round(revenueAgg[0]?.avg || 0),
      weakReviews,
    },
    window: {
      revenue: current.revenue,
      orders: current.count,
      averageOrder: current.avg,
      ordersToday: today.count,
      revenueToday: today.revenue,
      repeatRate: buyers ? Math.round((repeatBuyers / buyers) * 1000) / 10 : 0,
      buyers,
      growth: {
        revenue: growth(current.revenue, previous.revenue),
        orders: growth(current.count, previous.count),
        averageOrder: growth(current.avg, previous.avg),
      },
    },
    ordersByStatus: Object.fromEntries(statusAgg.map((s) => [s._id, s.count])),
    paymentsByStatus: Object.fromEntries(paymentAgg.map((s) => [s._id, s.count])),
    recentOrders, lowStock, salesSeries, topProducts, topCustomers, activity,
  }, 'آمار داشبورد');
});

export const adminListProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaging(req.query, { defaultLimit: 20 });
  const filter = {};
  if (req.query.search) filter.$text = { $search: String(req.query.search) };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status === 'inactive') filter.isActive = false;
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.stock === 'low') filter.stock = { $lte: 10 };
  if (req.query.stock === 'out') filter.stock = 0;
  const [products, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort({ updatedAt: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
    Product.countDocuments(filter),
  ]);
  return ok(res, { products, meta: meta(total, page, limit) }, 'محصولات (مدیریت)');
});

export const adminListReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaging(req.query, { defaultLimit: 20 });
  const filter = {};
  if (req.query.rating) filter.rating = Number(req.query.rating);
  const [reviews, total] = await Promise.all([
    Review.find(filter).populate('user', 'name email').populate('product', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Review.countDocuments(filter),
  ]);
  return ok(res, { reviews, meta: meta(total, page, limit) }, 'نظرات (مدیریت)');
});
