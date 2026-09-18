/**
 * کش HTTP برای GETهای عمومی.
 *
 * قبلاً هیچ هدر کشی روی API نبود، پس هر ناوبری در سایت (خانه → محصول → برگشت)
 * دوباره کل لیست محصولات و دسته‌بندی‌ها را از دیتابیس می‌خواند. با یک
 * `Cache-Control` کوتاه + ETag، مرور برگشتی از حافظه مرورگر جواب می‌گیرد و
 * پاسخ‌های تکراری با 304 بسته می‌شوند (بدنه‌ای منتقل نمی‌شود).
 *
 * فقط روی داده‌ی عمومی و بدون احراز هویت اعمال می‌شود؛ سبد، سفارش و پنل
 * مدیریت هرگز کش نمی‌شوند.
 */
export const publicCache = ({ seconds = 60, staleWhileRevalidate = 300 } = {}) => (req, res, next) => {
  if (req.method !== 'GET') return next();

  // پاسخ شخصی‌سازی‌شده نباید در کش مشترک بنشیند
  if (req.headers.authorization || req.cookies?.attari_rt) {
    res.set('Cache-Control', 'private, no-cache');
    return next();
  }

  res.set('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=${staleWhileRevalidate}`);
  res.set('Vary', 'Accept-Encoding, Origin');
  return next();
};

/** داده‌ای که تقریباً هرگز عوض نمی‌شود (دسته‌بندی‌ها). */
export const longCache = publicCache({ seconds: 300, staleWhileRevalidate: 3600 });

/** لیست و جزئیات محصول: تازگی مهم است ولی یک دقیقه کش قابل قبول است. */
export const shortCache = publicCache({ seconds: 60, staleWhileRevalidate: 300 });

/** پاسخ‌هایی که هرگز نباید کش شوند. */
export const noCache = (_req, res, next) => {
  res.set('Cache-Control', 'no-store, must-revalidate');
  next();
};
