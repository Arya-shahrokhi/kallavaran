import { User, ROLES } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/tokens.js';

const extract = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
};

/** الزامی: کاربر باید لاگین باشد. */
export const protect = asyncHandler(async (req, _res, next) => {
  const token = extract(req);
  if (!token) throw ApiError.unauthorized();
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('نشست شما منقضی شده است، دوباره وارد شوید');
  }
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized('حساب کاربری غیرفعال یا حذف شده است');
  req.user = user;
  next();
});

/** اختیاری: برای سبد مهمان و شخصی‌سازی. */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extract(req);
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub);
      if (user?.isActive) req.user = user;
    } catch { /* مهمان می‌ماند */ }
  }
  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
  return next();
};

export const adminOnly = authorize(ROLES.ADMIN);
