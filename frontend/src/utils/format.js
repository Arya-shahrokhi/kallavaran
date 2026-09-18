const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export const toFa = (value) => String(value ?? '').replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

export const toEn = (value) => String(value ?? '').replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));

/** قیمت تومان با جداکننده و رقم فارسی. */
export const toman = (amount, { suffix = true } = {}) => {
  const n = Number(amount || 0);
  const formatted = toFa(n.toLocaleString('en-US'));
  return suffix ? `${formatted} تومان` : formatted;
};

/** مبلغ فشرده برای کارت آمار و محور نمودار: ۱٫۲ م / ۸۴٫۶ م / ۳٫۱ میلیارد. */
export const shortToman = (amount) => {
  const n = Number(amount || 0);
  if (n >= 1e9) return `${toFa((n / 1e9).toFixed(1))} میلیارد`;
  if (n >= 1e6) return `${toFa((n / 1e6).toFixed(1))} میلیون`;
  if (n >= 1e3) return `${toFa(Math.round(n / 1e3))} هزار`;
  return toFa(n);
};

export const compactNumber = (n) => toFa(Number(n || 0).toLocaleString('en-US'));

export const percent = (value, { sign = false } = {}) => {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  const prefix = sign && n > 0 ? '+' : '';
  return `${prefix}${toFa(Math.abs(n) % 1 === 0 ? n : n.toFixed(1))}٪`;
};

export const faDate = (value) =>
  new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value));

export const faDateTime = (value) =>
  new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export const faClock = (value) =>
  new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));

/** برچسب کوتاه محور نمودار از تاریخ ISO. */
export const faDayLabel = (value) =>
  new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(new Date(value));

export const relativeTime = (value) => {
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('fa-IR', { numeric: 'auto' });
  const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(-Math.round(diff / secs), unit);
  }
  return 'همین حالا';
};

export const finalPrice = (product) =>
  product?.discount > 0 ? Math.round((product.price * (100 - product.discount)) / 1000) * 10 : product?.price || 0;

export const ORDER_STATUS_LABELS = {
  PENDING: 'در انتظار تأیید',
  CONFIRMED: 'تأیید شده',
  PROCESSING: 'در حال آماده‌سازی',
  SHIPPED: 'ارسال شده',
  DELIVERED: 'تحویل داده شده',
  CANCELLED: 'لغو شده',
};

export const ORDER_STATUS_TONE = {
  PENDING: 'bg-saffron-50 text-saffron-600',
  CONFIRMED: 'bg-moss-50 text-moss-700',
  PROCESSING: 'bg-moss-100 text-moss-900',
  SHIPPED: 'bg-bone-200 text-ink-700',
  DELIVERED: 'bg-moss-100 text-moss-900',
  CANCELLED: 'bg-berry-100 text-berry-600',
};

/** رنگ سکتورهای نمودار وضعیت؛ همان پالت تیلویند با OKLCH. */
export const ORDER_STATUS_COLOR = {
  PENDING: 'oklch(68% 0.145 62)',
  CONFIRMED: 'oklch(54% 0.095 148)',
  PROCESSING: 'oklch(38% 0.075 150)',
  SHIPPED: 'oklch(52% 0.1 240)',
  DELIVERED: 'oklch(28% 0.055 150)',
  CANCELLED: 'oklch(52% 0.14 20)',
};

/** آینه‌ی STATUS_FLOW سرور: فقط گام بعدی مجاز برای اقدام سریع. */
export const NEXT_STATUS = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
  DELIVERED: null,
  CANCELLED: null,
};

export const NEXT_STATUS_ACTION = {
  PENDING: 'تأیید سفارش',
  CONFIRMED: 'شروع آماده‌سازی',
  PROCESSING: 'ثبت ارسال',
  SHIPPED: 'ثبت تحویل',
};

export const PAYMENT_LABELS = { UNPAID: 'پرداخت نشده', PAID: 'پرداخت شده', REFUNDED: 'بازگشت داده شده', FAILED: 'ناموفق' };
