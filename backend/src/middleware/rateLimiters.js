import rateLimit from 'express-rate-limit';
import { fail } from '../utils/response.js';

const handler = (_req, res) => fail(res, 429, 'تعداد درخواست‌ها بیش از حد مجاز است، چند دقیقه بعد تلاش کنید');

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/** سخت‌گیرانه روی auth تا brute-force گران شود. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

export const writeLimiter = rateLimit({ windowMs: 60 * 1000, max: 40, handler });
