import { memo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiHeart } from 'react-icons/fi';
import Rating from '../ui/Rating.jsx';
import { toFa } from '../../utils/format.js';
import { useWishlist } from '../../context/WishlistContext.jsx';
import SmartImage from '../ui/SmartImage.jsx';

function ProductCard({ product, priority = false }) {
  /**
   * فقط actions (مرجع پایدار) مصرف می‌شود، نه داده‌ی سبد.
   * وضعیت «در حال افزودن» هم محلی است، نه از کانتکست.
   *
   * قبلاً این کامپوننت `useCart()` را می‌خواند که شامل خود سبد بود؛ نتیجه:
   * افزودن یک کالا باعث رندر مجدد هر ۱۲ کارت گرید می‌شد و memo هم بی‌اثر بود.
   */
  const { has, toggle } = useWishlist();
  const revealRef = useRef(null);
  useEffect(() => {
    const node = revealRef.current;
    if (!node) return undefined;
    if (!('IntersectionObserver' in window)) { node.classList.add('is-visible'); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { node.classList.add('is-visible'); observer.disconnect(); }
    }, { threshold: 0.05, rootMargin: '0px 0px 80px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const liked = has(product._id);
  const out = product.stock <= 0;
  const low = !out && product.stock <= 5;

  return (
    <article ref={revealRef} className="group relative flex flex-col" data-reveal>
      <div className="product-media relative aspect-[4/5] overflow-hidden rounded-2xl bg-bone-100">
        <Link to={`/products/${product.slug}`} className="block size-full" aria-label={product.name}>
          {/* چهار کارت اول در دید اولیه‌اند: زودتر دانلود و رمزگشایی می‌شوند */}
          <SmartImage
            src={product.images?.[0]?.url}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            fetchpriority={priority ? 'high' : 'auto'}
            decoding={priority ? 'sync' : 'async'}
            width="600"
            height="750"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
            className="size-full object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.06]"
            fallbackClassName="text-sm"
          />
        </Link>

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-col items-start gap-1.5">
            {product.discount > 0 && (
              <span className="num chip bg-berry-600 text-bone-50">٪{toFa(product.discount)} تخفیف</span>
            )}
            {out && <span className="chip bg-ink-900 text-bone-50">ناموجود</span>}
            {low && <span className="num chip bg-saffron-500 text-ink-900">{toFa(product.stock)} عدد مانده</span>}
          </div>
          <button
            type="button"
            onClick={() => toggle(product._id)}
            aria-label={liked ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
            aria-pressed={liked}
            className="pointer-events-auto grid size-11 shrink-0 place-items-center rounded-full bg-bone-50/95 text-ink-500 shadow-card transition-[color,transform] duration-150 hover:text-berry-600 active:scale-90"
          >
            <FiHeart size={16} className={liked ? 'fill-berry-600 text-berry-600' : ''} />
          </button>
        </div>

        <Link
          to={`/products/${product.slug}`}
          className="absolute inset-x-3 bottom-3 flex h-11 translate-y-[130%] items-center justify-center gap-2 rounded-xl bg-moss-900 text-sm font-medium text-bone-50 opacity-0 transition-[transform,opacity,background-color] duration-300 ease-expo hover:bg-moss-700 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 max-md:translate-y-0 max-md:opacity-100"
        >
          مشاهده محصول <FiArrowLeft size={16} />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 pt-3.5">
        <span className="text-2xs font-medium tracking-wide text-moss-600">{product.category?.name}</span>
        <h3 className="text-[0.95rem] font-semibold leading-6 text-ink-900">
          <Link to={`/products/${product.slug}`} className="hover:text-moss-700">{product.name}</Link>
        </h3>
        <Rating value={product.rating} count={product.reviewsCount} />
        <Link to={`/products/${product.slug}`} className="mt-auto flex items-center gap-1.5 pt-2 text-xs font-bold text-moss-700 hover:text-moss-900">
          جزئیات و قیمت <FiArrowLeft size={14} />
        </Link>
      </div>
    </article>
  );
}

/**
 * مقایسه‌ی سطحی روی همان فیلدهایی که رندر را عوض می‌کنند.
 * پاسخ‌های تازه‌ی API آبجکت‌های جدید می‌سازند، پس مقایسه‌ی مرجع بی‌فایده است.
 */
export default memo(ProductCard, (prev, next) => (
  prev.product._id === next.product._id
  && prev.product.stock === next.product.stock
  && prev.product.price === next.product.price
  && prev.product.discount === next.product.discount
  && prev.product.rating === next.product.rating
  && prev.product.reviewsCount === next.product.reviewsCount
  && prev.priority === next.priority
));
