import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiters.js';

export const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
// ETag قوی: پاسخ‌های تکراری با 304 بسته می‌شوند، بدون انتقال بدنه
app.set('etag', 'strong');

/**
 * compression اول صف: قبلاً بعد از body parser و sanitizer نشسته بود، یعنی
 * پاسخ‌های خطا و استاتیک از مسیرهای بالاتر بی‌فشرده رد می‌شدند.
 * حالا هر چیزی که از اپ بیرون می‌رود gzip/br می‌شود.
 */
app.use(compression({
  threshold: 1024,
  // اگر کلاینت صریحاً نخواهد، فشرده نکن
  filter: (req, res) => (req.headers['x-no-compression'] ? false : compression.filter(req, res)),
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // فرانت جدا سرو می‌شود؛ CSP روی لایه استاتیک تنظیم می‌شود
}));

app.use(cors({
  origin(origin, cb) {
    if (!origin || env.clientOrigin.includes(origin)) return cb(null, true);
    return cb(new Error('این دامنه اجازه دسترسی ندارد'));
  },
  credentials: true,
  exposedHeaders: ['X-Guest-Id'],
  maxAge: 86400, // preflight یک روز کش می‌شود، نه هر درخواست
}));

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());
app.use(mongoSanitize());   // حذف $ و . از ورودی: NoSQL injection
app.use(xss());             // پاکسازی HTML مخرب

if (!env.isProd) app.use(morgan('dev'));
// در پرودکشن لاگ درخواست‌های موفق استاتیک نویز است و I/O می‌سوزاند
else app.use(morgan('combined', { skip: (req, res) => res.statusCode < 400 }));

app.use('/uploads', express.static('uploads', {
  maxAge: '30d',
  immutable: true,
  etag: true,
  lastModified: true,
}));

app.use('/api', apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);
