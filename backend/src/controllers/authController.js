import { User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/response.js';
import { pick } from '../utils/pick.js';
import {
  REFRESH_COOKIE, refreshCookieOptions, signAccessToken, signRefreshToken, verifyRefreshToken,
} from '../utils/tokens.js';
import { Cart } from '../models/Cart.js';

const issueSession = (res, user) => {
  res.cookie(REFRESH_COOKIE, signRefreshToken(user), refreshCookieOptions());
  return { user: user.toJSON(), accessToken: signAccessToken(user) };
};

/** ادغام سبد مهمان با سبد کاربر بعد از ورود. */
const mergeGuestCart = async (req, user) => {
  const guestId = req.headers['x-guest-id'];
  if (!guestId) return;
  const guestCart = await Cart.findOne({ guestId });
  if (!guestCart?.items.length) return;
  const userCart = await Cart.findOne({ user: user._id }) || new Cart({ user: user._id, items: [] });
  for (const item of guestCart.items) {
    const existing = userCart.items.find((i) => String(i.product) === String(item.product));
    if (existing) existing.quantity = Math.min(50, existing.quantity + item.quantity);
    else userCart.items.push({ product: item.product, quantity: item.quantity, priceAtAdd: item.priceAtAdd });
  }
  await userCart.save();
  await guestCart.deleteOne();
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (await User.exists({ $or: [{ email }, { phone }] })) {
    throw ApiError.conflict('کاربری با این ایمیل یا شماره موبایل ثبت شده است');
  }
  const user = await User.create({ name, email, phone, password });
  await mergeGuestCart(req, user);
  return created(res, issueSession(res, user), 'حساب شما با موفقیت ساخته شد');
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const query = identifier.includes('@') ? { email: identifier.toLowerCase() } : { phone: identifier };
  const user = await User.findOne(query).select('+password +tokenVersion');
  // پیام یکسان تا وجود یا نبود حساب لو نرود
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('ایمیل/موبایل یا رمز عبور اشتباه است');
  }
  if (!user.isActive) throw ApiError.forbidden('حساب شما غیرفعال شده است، با پشتیبانی تماس بگیرید');

  user.lastLoginAt = new Date();
  await user.save({ validateModifiedOnly: true });
  await mergeGuestCart(req, user);
  return ok(res, issueSession(res, user), `خوش آمدید ${user.name}`);
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized('نشست معتبری وجود ندارد');
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('نشست منقضی شده است');
  }
  const user = await User.findById(payload.sub).select('+tokenVersion');
  if (!user || !user.isActive || (user.tokenVersion ?? 0) !== payload.tv) {
    throw ApiError.unauthorized('نشست معتبر نیست');
  }
  return ok(res, issueSession(res, user), 'نشست تازه شد');
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
  }
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(), maxAge: undefined });
  return ok(res, {}, 'از حساب خود خارج شدید');
});

export const me = asyncHandler(async (req, res) => ok(res, { user: req.user.toJSON() }, 'اطلاعات حساب'));

export const updateMe = asyncHandler(async (req, res) => {
  const updates = pick(req.body, ['name', 'email', 'phone']);
  Object.assign(req.user, updates);
  await req.user.save({ validateModifiedOnly: true });
  return ok(res, { user: req.user.toJSON() }, 'پروفایل به‌روزرسانی شد');
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) {
    throw ApiError.badRequest('رمز عبور فعلی اشتباه است');
  }
  user.password = req.body.newPassword;
  user.tokenVersion = (user.tokenVersion ?? 0) + 1; // ابطال نشست‌های دیگر
  await user.save();
  return ok(res, {}, 'رمز عبور تغییر کرد');
});

export const listAddresses = asyncHandler(async (req, res) =>
  ok(res, { addresses: req.user.addresses }, 'لیست آدرس‌ها'));

export const addAddress = asyncHandler(async (req, res) => {
  if (req.user.addresses.length >= 8) throw ApiError.badRequest('حداکثر ۸ آدرس می‌توانید ذخیره کنید');
  req.user.addresses.push({ ...req.body, isDefault: req.body.isDefault || req.user.addresses.length === 0 });
  await req.user.save();
  return created(res, { addresses: req.user.addresses }, 'آدرس اضافه شد');
});

export const updateAddress = asyncHandler(async (req, res) => {
  const address = req.user.addresses.id(req.params.addressId);
  if (!address) throw ApiError.notFound('آدرس پیدا نشد');
  address.set(req.body);
  if (req.body.isDefault) req.user.addresses.forEach((a) => { a.isDefault = String(a._id) === String(address._id); });
  await req.user.save();
  return ok(res, { addresses: req.user.addresses }, 'آدرس ویرایش شد');
});

export const removeAddress = asyncHandler(async (req, res) => {
  const address = req.user.addresses.id(req.params.addressId);
  if (!address) throw ApiError.notFound('آدرس پیدا نشد');
  address.deleteOne();
  await req.user.save();
  return ok(res, { addresses: req.user.addresses }, 'آدرس حذف شد');
});
