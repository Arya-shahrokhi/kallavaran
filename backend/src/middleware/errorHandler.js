import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { fail } from '../utils/response.js';

export const notFound = (req, _res, next) =>
  next(ApiError.notFound(`مسیر ${req.method} ${req.originalUrl} وجود ندارد`));

/** Error Handler مرکزی: خروجی همیشه {success:false, message, error}. */
export const errorHandler = (err, _req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'خطای غیرمنتظره در سرور';
  let details = err.details;

  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = 'اطلاعات ارسالی معتبر نیست';
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = 'شناسه ارسالی معتبر نیست';
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    const labels = { email: 'ایمیل', phone: 'شماره موبایل', slug: 'نامک', name: 'نام' };
    message = `${labels[field] || 'این مقدار'} قبلاً ثبت شده است`;
  } else if (err.name === 'MulterError') {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'حجم فایل بیش از حد مجاز است' : 'خطا در آپلود فایل';
  }

  if (status >= 500) console.error('[error]', err);

  return fail(res, status, message, {
    ...(details ? { details } : {}),
    ...(env.isProd ? {} : { stack: err.stack }),
  });
};
