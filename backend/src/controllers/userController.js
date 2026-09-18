import { Order, User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { getPaging, meta } from '../utils/pagination.js';
import { pick } from '../utils/pick.js';

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaging(req.query, { defaultLimit: 20 });
  const filter = {};
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  if (req.query.role) filter.role = req.query.role;
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  return ok(res, { users, meta: meta(total, page, limit) }, 'لیست کاربران');
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('کاربر پیدا نشد');
  const orders = await Order.find({ user: user._id }).select('orderNumber total orderStatus createdAt').sort({ createdAt: -1 }).limit(10).lean();
  return ok(res, { user: user.toJSON(), orders }, 'جزئیات کاربر');
});

export const updateUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id) && req.body.role && req.body.role !== req.user.role) {
    throw ApiError.badRequest('نمی‌توانید نقش خودتان را تغییر دهید');
  }
  const user = await User.findByIdAndUpdate(req.params.id, pick(req.body, ['role', 'isActive', 'name']), {
    new: true, runValidators: true,
  });
  if (!user) throw ApiError.notFound('کاربر پیدا نشد');
  return ok(res, { user: user.toJSON() }, 'کاربر به‌روزرسانی شد');
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) throw ApiError.badRequest('نمی‌توانید حساب خودتان را حذف کنید');
  const hasOrders = await Order.exists({ user: req.params.id });
  if (hasOrders) {
    // حفظ یکپارچگی سفارش‌ها: غیرفعال‌سازی به‌جای حذف
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) throw ApiError.notFound('کاربر پیدا نشد');
    return ok(res, { user: user.toJSON() }, 'کاربر سفارش ثبت‌شده دارد، به‌جای حذف غیرفعال شد');
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound('کاربر پیدا نشد');
  return ok(res, {}, 'کاربر حذف شد');
});
