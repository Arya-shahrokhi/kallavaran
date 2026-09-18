import { useEffect, useState } from 'react';

/** عرض‌هایی که در public/images ساخته شده‌اند. */
const PRODUCT_WIDTHS = [300, 500, 800];
const HERO_WIDTHS = [800, 1200, 1800];

/** آیا این مسیر یک تصویر محلی است که نسخه‌های ریسپانسیو دارد؟ */
const localBase = (src) => {
  if (typeof src !== 'string' || !src.startsWith('/images/') || (!src.endsWith('.jpg') && !src.endsWith('.webp'))) return null;
  return src.replace(/\.(?:jpg|webp)$/, '');
};

/**
 * تصویر با fallback واقعی + تصاویر ریسپانسیو.
 *
 * تا پیش از این هیچ <img> در پروژه onError نداشت؛ یک لینک خراب فقط یک
 * مستطیل خالی نشان می‌داد، نه پیام «بدون تصویر».
 *
 * بخش عملکردی: قبلاً برای هر تصویر فقط یک فایل تمام‌عرض سرو می‌شد، یعنی
 * موبایل هم همان تصویر ۹۰۰ پیکسلی کارت محصول را می‌گرفت. حالا با
 * srcset/sizes مرورگر کوچک‌ترین نسخه‌ی کافی را انتخاب می‌کند
 * (کارت محصول روی موبایل: حدود ۲۰ کیلوبایت به‌جای ۱۵۰).
 */
export default function SmartImage({
  src,
  alt = '',
  className = '',
  fallbackClassName = '',
  fallbackLabel = 'بدون تصویر',
  fallbackIcon = null,
  sizes,
  variant = 'product',
  ...rest
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <span
        role="img"
        aria-label={alt || fallbackLabel}
        className={`grid place-items-center bg-bone-100 text-ink-300 ${className} ${fallbackClassName}`}
      >
        {fallbackIcon ?? <span className="px-1 text-center text-2xs leading-tight">{fallbackLabel}</span>}
      </span>
    );
  }

  const img = (
    <img src={src} alt={alt} onError={() => setFailed(true)} className={className} {...rest} />
  );

  const base = localBase(src);
  if (!base) return img;

  const widths = variant === 'hero' ? HERO_WIDTHS : PRODUCT_WIDTHS;
  const srcSet = widths.map((w) => `${base}-${w}.webp ${w}w`).join(', ');

  // پیش‌فرض معقول: دو ستون روی موبایل، چهار ستون روی دسکتاپ
  const sizesAttr = sizes || (variant === 'hero'
    ? '100vw'
    : '(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw');

  return (
    <picture>
      <source type="image/webp" srcSet={srcSet} sizes={sizesAttr} />
      {/* نسخه‌ی jpg سبک‌شده، فقط برای مرورگرهای بدون پشتیبانی webp */}
      <img src={src} alt={alt} onError={() => setFailed(true)} className={className} {...rest} />
    </picture>
  );
}
