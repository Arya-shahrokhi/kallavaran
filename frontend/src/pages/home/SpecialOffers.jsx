import { Link } from 'react-router-dom';
import { FiArrowLeft, FiClock } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { toFa } from '../../utils/format.js';
import { useInView } from '../../hooks/index.js';
import { SkeletonBlock } from '../../components/ui/Skeleton.jsx';
import SmartImage from '../../components/ui/SmartImage.jsx';

const endOfDay = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
};

/**
 * شمارش معکوس.
 *
 * قبلاً setInterval یک‌ثانیه‌ای بی‌قید‌وشرط اجرا می‌شد: حتی وقتی این بخش
 * چند صفحه پایین‌تر از دید کاربر بود یا تب در پس‌زمینه بود، هر ثانیه یک
 * رندر می‌گرفت. حالا فقط در دید و با تب فعال تیک می‌زند.
 */
function Countdown() {
  const [ref, inView] = useInView({ rootMargin: '100px' });
  const [left, setLeft] = useState(endOfDay() - Date.now());

  useEffect(() => {
    if (!inView) return undefined;

    const tick = () => setLeft(endOfDay() - Date.now());
    tick();

    let id = setInterval(tick, 1000);
    const onVisibility = () => {
      clearInterval(id);
      if (!document.hidden) { tick(); id = setInterval(tick, 1000); }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisibility); };
  }, [inView]);
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  const pad = (n) => toFa(String(n).padStart(2, '0'));
  return (
    <div ref={ref} className="num flex items-center gap-1.5 text-bone-50">
      <FiClock size={16} className="text-saffron-500" />
      {[h, m, s].map((v, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="opacity-40">:</span>}
          <span className="rounded-lg bg-bone-50/12 px-2 py-1 text-sm font-bold">{pad(v)}</span>
        </span>
      ))}
    </div>
  );
}

export default function SpecialOffers({ products, loading }) {
  const [hero, ...rest] = products || [];

  return (
    <section className="wrap py-16 sm:py-20" data-reveal>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-2xs font-bold uppercase tracking-[0.14em] text-berry-600">پیشنهادهای محدود</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">تخفیف‌های امروز</h2>
          <p className="mt-2 max-w-[52ch] text-sm leading-7 text-ink-500">محصولات پرمصرف با قیمت بهتر، تا پایان امروز یا تا تمام شدن موجودی.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-bone-100 px-3 py-2">
          <FiClock size={15} className="text-berry-600" />
          <span className="text-xs font-semibold text-ink-500">زمان باقی‌مانده</span>
          <Countdown />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1.85fr]">
        <div className="overflow-hidden rounded-3xl bg-ink-900 p-6 text-bone-50 sm:p-8">
          {loading ? <SkeletonBlock className="h-72 w-full rounded-2xl opacity-20" /> : hero ? (
            <Link to={`/products/${hero.slug}`} className="group block">
              <div className="relative overflow-hidden rounded-2xl bg-bone-50/10">
                <SmartImage src={hero.images?.[0]?.url} alt={hero.name} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-105" fallbackLabel="" />
                <span className="absolute right-3 top-3 chip bg-berry-600 text-bone-50">٪{toFa(hero.discount)} تخفیف</span>
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-lg font-extrabold">{hero.name}</p>
                  <p className="mt-1 text-xs text-bone-200/65">انتخاب ویژه امروز</p>
                </div>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-saffron-500 text-ink-900 transition-transform duration-200 group-hover:-translate-x-1"><FiArrowLeft size={18} /></span>
              </div>
            </Link>
          ) : <p className="py-20 text-center text-sm text-bone-200/60">فعلاً پیشنهاد تخفیفی نداریم.</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 min-[390px]:grid-cols-2">
          {(loading ? Array.from({ length: 4 }) : rest.slice(0, 4)).map((p, i) => (
            <div key={p?._id || i} className="rounded-3xl border hairline bg-bone-50 p-3 shadow-card transition-shadow duration-200 hover:shadow-lift">
              {p ? (
                <Link to={`/products/${p.slug}`} className="group block">
                  <div className="relative overflow-hidden rounded-2xl bg-bone-100">
                    <SmartImage src={p.images?.[0]?.url} alt={p.name} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-105" fallbackLabel="" />
                    <span className="absolute right-2.5 top-2.5 chip bg-berry-600 text-bone-50">٪{toFa(p.discount)}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2 px-1 pb-1 pt-3">
                    <p className="min-w-0 truncate text-sm font-bold text-ink-900">{p.name}</p>
                    <FiArrowLeft className="mt-0.5 shrink-0 text-moss-600 transition-transform group-hover:-translate-x-1" size={16} />
                  </div>
                </Link>
              ) : <SkeletonBlock className="aspect-[4/3] w-full rounded-2xl" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
