import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertTriangle, FiArrowDownRight, FiArrowUpRight, FiBox, FiChevronsLeft, FiEdit3,
  FiMinus, FiPackage, FiPercent, FiPlus, FiRepeat, FiShoppingBag, FiStar, FiTrendingUp,
  FiUserPlus, FiUsers,
} from 'react-icons/fi';
import Badge from '../../../components/ui/Badge.jsx';
import SmartImage from '../../../components/ui/SmartImage.jsx';
import { RowsSkeleton, SkeletonBlock } from '../../../components/ui/Skeleton.jsx';
import {
  ORDER_STATUS_COLOR, ORDER_STATUS_LABELS, ORDER_STATUS_TONE,
  faClock, faDayLabel, percent, relativeTime, shortToman, toFa, toman,
} from '../../../utils/format.js';

/* ---------- اجزای کوچک مشترک ---------- */

export function Delta({ value, suffix = '' }) {
  if (value === null || value === undefined) return null;
  const n = Number(value || 0);
  if (!n) return <p className="mt-1.5 text-2xs text-ink-300">بدون تغییر نسبت به بازه قبل</p>;
  const up = n > 0;
  const Icon = up ? FiArrowUpRight : FiArrowDownRight;
  return (
    <p className={`mt-1.5 flex items-center gap-1 text-2xs font-bold ${up ? 'text-moss-700' : 'text-berry-600'}`}>
      <Icon size={12} /> <span className="num">{percent(n)}</span>
      <span className="font-medium text-ink-400">{suffix || 'نسبت به بازه قبل'}</span>
    </p>
  );
}

function Sparkline({ points, tone = 'moss' }) {
  if (points.length < 2) return null;
  const max = Math.max(...points, 1);
  const d = points.map((v, i) => `${(i / (points.length - 1)) * 72},${24 - (v / max) * 21}`).join(' ');
  return (
    <svg viewBox="0 0 72 24" className="absolute bottom-4 left-5 h-6 w-[4.5rem] overflow-visible" aria-hidden="true">
      <polyline
        points={d}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={tone === 'berry' ? 'stroke-berry-600' : 'stroke-moss-500'}
      />
    </svg>
  );
}

/* ---------- ردیف شاخص‌ها ---------- */

export function Ledger({ data, points, loading }) {
  const w = data?.window;
  const revenues = points.map((p) => p.revenue);
  const counts = points.map((p) => p.count);

  const cells = [
    {
      label: 'فروش بازه',
      icon: FiTrendingUp,
      value: w && toman(w.revenue, { suffix: false }),
      unit: 'تومان',
      delta: w?.growth.revenue,
      spark: revenues,
      to: '/admin/orders',
    },
    {
      label: 'سفارش‌های بازه',
      icon: FiShoppingBag,
      value: w && toFa(w.orders),
      hint: w && `${toFa(w.ordersToday)} سفارش امروز`,
      delta: w?.growth.orders,
      spark: counts,
      to: '/admin/orders',
    },
    {
      label: 'میانگین سبد خرید',
      icon: FiPercent,
      value: w && toman(w.averageOrder, { suffix: false }),
      unit: 'تومان',
      delta: w?.growth.averageOrder,
      spark: revenues,
    },
    {
      label: 'نرخ خرید مجدد',
      icon: FiRepeat,
      value: w && percent(w.repeatRate),
      hint: w && `از ${toFa(w.buyers)} خریدار فعال`,
      spark: counts,
      tone: 'berry',
      to: '/admin/users',
    },
  ];

  return (
    <div className="mt-7 grid overflow-hidden rounded-2xl border hairline bg-bone-50 shadow-card sm:grid-cols-2 xl:grid-cols-4">
      {cells.map((c, i) => {
        const inner = (
          <>
            <div className="flex items-center justify-between text-xs font-medium text-ink-400">
              <span>{c.label}</span>
              <c.icon size={16} className="text-moss-600" />
            </div>
            {loading ? <SkeletonBlock className="mt-4 h-7 w-28" /> : (
              <p className="num mt-3 text-2xl font-extrabold tracking-tight">
                {c.value}
                {c.unit && <span className="mr-1 text-xs font-medium text-ink-400">{c.unit}</span>}
              </p>
            )}
            {!loading && (c.delta !== undefined ? <Delta value={c.delta} /> : <p className="mt-1.5 text-2xs text-ink-400">{c.hint}</p>)}
            {!loading && c.hint && c.delta !== undefined && <p className="mt-0.5 text-2xs text-ink-300">{c.hint}</p>}
            {!loading && <Sparkline points={c.spark} tone={c.tone} />}
          </>
        );
        const cls = `relative min-h-[8rem] p-5 transition-colors ${i < 3 ? 'sm:border-l' : ''} hairline ${i < 2 ? 'border-b sm:border-b xl:border-b-0' : ''} ${c.to ? 'hover:bg-moss-50/60' : ''}`;
        return c.to
          ? <Link key={c.label} to={c.to} className={cls}>{inner}</Link>
          : <div key={c.label} className={cls}>{inner}</div>;
      })}
    </div>
  );
}

/* ---------- نمودار روند ---------- */

const smooth = (pts) => pts.reduce((d, p, i, all) => {
  if (i === 0) return `M ${p.x} ${p.y}`;
  const prev = all[i - 1];
  const cx = (prev.x + p.x) / 2;
  return `${d} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
}, '');

const RANGES = [[7, '۷ روز'], [14, '۱۴ روز'], [30, '۳۰ روز'], [90, '۳ ماه']];

export function TrendChart({ points, days, onDays, loading, metric, onMetric }) {
  const [hover, setHover] = useState(null);
  const W = 760;
  const H = 200;

  const { path, area, max, xy } = useMemo(() => {
    const values = points.map((p) => (metric === 'orders' ? p.count : p.revenue));
    const peak = Math.max(...values, 1);
    const coords = points.map((p, i) => ({
      x: points.length > 1 ? (i / (points.length - 1)) * W : W / 2,
      y: H - ((metric === 'orders' ? p.count : p.revenue) / peak) * (H - 26) - 10,
      ...p,
    }));
    const line = smooth(coords);
    return { path: line, area: `${line} L ${W} ${H} L 0 ${H} Z`, max: peak, xy: coords };
  }, [points, metric]);

  const empty = !loading && points.every((p) => p.count === 0);
  const active = hover != null ? xy[hover] : null;
  const tooltipPosition = hover === 0
    ? 'translate-x-0'
    : hover === xy.length - 1
      ? '-translate-x-full'
      : '-translate-x-1/2';

  return (
    <section className="rounded-2xl border hairline bg-bone-50 p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight">روند فروش</h2>
          <p className="mt-1 text-xs text-ink-500">داده‌های واقعی سفارش‌های ثبت‌شده، بدون سفارش‌های لغوشده.</p>
        </div>
        <div className="flex max-w-full flex-wrap items-center gap-2">
          <div className="flex rounded-xl border hairline bg-bone-100 p-0.5" role="group" aria-label="نوع شاخص">
            {[['revenue', 'درآمد'], ['orders', 'تعداد']].map(([k, label]) => (
              <button
                key={k}
                onClick={() => onMetric(k)}
                className={`h-8 rounded-[0.6rem] px-3 text-2xs font-bold transition-colors ${metric === k ? 'bg-bone-50 text-moss-700 shadow-card' : 'text-ink-400 hover:text-ink-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex max-w-full overflow-x-auto rounded-xl border hairline bg-bone-100 p-0.5" role="group" aria-label="بازه زمانی">
            {RANGES.map(([value, label]) => (
              <button
                key={value}
                onClick={() => onDays(value)}
                className={`h-8 rounded-[0.6rem] px-2.5 text-2xs font-bold transition-colors ${days === value ? 'bg-bone-50 text-moss-700 shadow-card' : 'text-ink-400 hover:text-ink-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? <SkeletonBlock className="mt-6 h-52 w-full" /> : empty ? (
        <div className="mt-6 grid h-52 place-items-center rounded-xl border border-dashed hairline text-center">
          <div>
            <FiBox className="mx-auto text-ink-300" size={26} />
            <p className="mt-3 text-sm font-semibold">در این بازه سفارشی ثبت نشده است.</p>
            <p className="mt-1 text-xs text-ink-400">بازه بلندتری انتخاب کن یا داده‌های نمونه را seed کن.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative mt-6" dir="ltr">
            <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[200px] flex-col justify-between text-2xs text-ink-300">
              {[1, 0.5, 0].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <span className="num w-16 shrink-0 text-right">{metric === 'orders' ? toFa(Math.round(max * f)) : shortToman(max * f)}</span>
                  <span className="h-px flex-1 bg-bone-200" />
                </div>
              ))}
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-[200px] w-full" preserveAspectRatio="none" role="img" aria-label="نمودار روند فروش">
              <path d={area} className="fill-moss-100/70" />
              <path d={path} className="stroke-moss-600" fill="none" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              {active && (
                <>
                  <line x1={active.x} y1="0" x2={active.x} y2={H} className="stroke-moss-300" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="4 4" />
                  <circle cx={active.x} cy={active.y} r="5" className="fill-bone-50 stroke-moss-600" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                </>
              )}
            </svg>
            <div className="absolute inset-0 flex" onMouseLeave={() => setHover(null)}>
              {xy.map((p, i) => (
                <button
                  key={p.date}
                  className="h-full flex-1 cursor-pointer rounded-sm focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-moss-500"
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onClick={() => setHover(i)}
                  aria-pressed={hover === i}
                  aria-label={`${faDayLabel(p.date)}: ${toman(p.revenue)}`}
                />
              ))}
            </div>
            {active && (
              <div
                className={`pointer-events-none absolute -top-2 z-10 max-w-[calc(100%_-_1rem)] whitespace-normal rounded-xl bg-ink-900 px-3 py-2 text-bone-50 shadow-lift sm:whitespace-nowrap ${tooltipPosition}`}
                style={{ left: `${(hover / Math.max(1, xy.length - 1)) * 100}%` }}
                dir="rtl"
              >
                <span className="block text-2xs text-bone-300/70">{faDayLabel(active.date)}</span>
                <span className="num block text-xs font-bold text-saffron-200">{toman(active.revenue)}</span>
                <span className="num block text-2xs text-bone-200/60">{toFa(active.count)} سفارش</span>
              </div>
            )}
          </div>
          {xy.length > 0 && (
            <div className="mt-3 flex justify-between text-2xs text-ink-300" dir="ltr">
              {[0, Math.floor(xy.length / 2), xy.length - 1].map((i) => <span key={`${i}-${xy[i].date}`}>{faDayLabel(xy[i].date)}</span>)}
            </div>
          )}
        </>
      )}
    </section>
  );
}

/* ---------- ترکیب وضعیت سفارش‌ها ---------- */

export function StatusMix({ ordersByStatus, loading }) {
  const entries = Object.entries(ordersByStatus || {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);

  let acc = 0;
  const stops = entries.map(([key, value]) => {
    const from = (acc / total) * 100;
    acc += value;
    return `${ORDER_STATUS_COLOR[key] || 'oklch(88% 0.014 92)'} ${from}% ${(acc / total) * 100}%`;
  }).join(',');

  return (
    <section className="rounded-2xl border hairline bg-bone-50 p-5 shadow-card sm:p-6">
      <h2 className="text-base font-bold tracking-tight">ترکیب سفارش‌ها</h2>
      <p className="mt-1 text-xs text-ink-500">برای فیلتر شدن، روی هر وضعیت بزن.</p>

      {loading ? <SkeletonBlock className="mt-6 h-32 w-full" /> : total === 0 ? (
        <p className="py-10 text-center text-sm text-ink-400">هنوز سفارشی ثبت نشده است.</p>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <div className="relative grid size-[8.5rem] shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${stops})` }}>
            <div className="grid size-[5.6rem] place-items-center rounded-full bg-bone-50 text-center">
              <span className="num text-lg font-extrabold leading-none">{toFa(total)}</span>
              <span className="-mt-1 text-2xs text-ink-400">سفارش</span>
            </div>
          </div>
          <ul className="min-w-[11rem] flex-1 space-y-2.5">
            {entries.map(([key, value]) => (
              <li key={key}>
                <Link to={`/admin/orders?status=${key}`} className="group flex items-center gap-2.5 text-xs text-ink-500">
                  <span className="size-2 shrink-0 rounded" style={{ background: ORDER_STATUS_COLOR[key] }} />
                  <span className="group-hover:text-moss-700">{ORDER_STATUS_LABELS[key] || key}</span>
                  <span className="num mr-auto font-bold text-ink-900">{percent(Math.round((value / total) * 1000) / 10)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/* ---------- سفارش‌های زنده ---------- */

const TABS = [['', 'همه'], ['PENDING', 'در انتظار'], ['PROCESSING', 'آماده‌سازی'], ['SHIPPED', 'ارسال‌شده']];

export function OrdersPanel({ feed, counts, onAdvance, busyId }) {
  return (
    <section className="min-w-0 rounded-2xl border hairline bg-bone-50 p-5 shadow-card sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight">سفارش‌های زنده</h2>
          <p className="mt-1 text-xs text-ink-500">وضعیت را بدون خروج از داشبورد جلو ببر.</p>
        </div>
        <Link to="/admin/orders" className="btn btn-outline btn-sm text-xs">همه سفارش‌ها</Link>
      </div>

      <div className="mt-5 flex max-w-full gap-5 overflow-x-auto border-b hairline">
        {TABS.map(([value, label]) => (
          <button
            key={value || 'all'}
            onClick={() => feed.setStatus(value)}
            className={`relative -mb-px pb-3 text-xs transition-colors ${feed.status === value ? 'font-extrabold text-moss-700' : 'text-ink-400 hover:text-ink-700'}`}
          >
            {label}
            {counts?.[value || 'all'] != null && <span className="num mr-1 text-ink-300">{toFa(counts[value || 'all'])}</span>}
            {feed.status === value && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-moss-600" />}
          </button>
        ))}
      </div>

      {feed.loading ? <RowsSkeleton rows={5} /> : feed.error ? (
        <div className="py-10 text-center">
          <p className="text-sm text-berry-600">{feed.error}</p>
          <button onClick={feed.reload} className="btn btn-outline btn-sm mt-3 text-xs">تلاش دوباره</button>
        </div>
      ) : feed.orders.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-400">سفارشی با این وضعیت وجود ندارد.</p>
      ) : (
        <ul className="divide-y hairline">
          {feed.orders.map((o) => (
              <li key={o._id} className="flex flex-wrap items-center gap-3 py-3.5">
                <Link to={`/admin/orders/${o._id}`} className="num shrink-0 text-xs font-bold text-moss-700 hover:underline" dir="ltr">
                  {o.orderNumber}
                </Link>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold">{o.user?.name || 'مهمان'}</span>
                  <span className="num block text-2xs text-ink-400" dir="ltr">{o.user?.phone || o.user?.email || 'بدون اطلاعات تماس'}</span>
                </span>
                <span className="num shrink-0 text-xs font-bold">{toman(o.total, { suffix: false })}</span>
                <Badge className={ORDER_STATUS_TONE[o.orderStatus]}>{ORDER_STATUS_LABELS[o.orderStatus]}</Badge>
                <span className="num hidden shrink-0 text-2xs text-ink-300 sm:block">{faClock(o.createdAt)}</span>
                {o.nextStatuses?.length > 0 ? (
                  <button
                    onClick={() => onAdvance(o, o.nextStatuses[0])}
                    disabled={busyId === String(o._id)}
                    className="btn btn-outline btn-sm shrink-0 text-2xs disabled:opacity-50"
                    title={`تغییر به ${ORDER_STATUS_LABELS[o.nextStatuses[0]] || o.nextStatuses[0]}`}
                  >
                    {busyId === String(o._id) ? 'در حال ثبت…' : (ORDER_STATUS_LABELS[o.nextStatuses[0]] || 'گام بعدی')}
                    <FiChevronsLeft size={13} />
                  </button>
                ) : <span className="w-[5.5rem] shrink-0" />}
              </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------- موجودی کم با اصلاح درجا ---------- */

export function LowStockPanel({ items, loading, onAdjust, busyId }) {
  return (
    <section className="rounded-2xl border hairline bg-bone-50 p-5 shadow-card sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold tracking-tight">
            <FiAlertTriangle size={16} className="text-saffron-600" /> هشدار موجودی
          </h2>
          <p className="mt-1 text-xs text-ink-500">موجودی را همین‌جا کم و زیاد کن.</p>
        </div>
        {!loading && items?.length > 0 && <Badge tone="berry">{toFa(items.length)} مورد</Badge>}
      </div>

      {loading ? <RowsSkeleton rows={4} /> : !items?.length ? (
        <div className="py-12 text-center">
          <FiPackage className="mx-auto text-moss-300" size={24} />
          <p className="mt-3 text-sm font-semibold">همه محصولات موجودی کافی دارند.</p>
        </div>
      ) : (
        <ul className="divide-y hairline">
          {items.map((p) => (
            <li key={p._id} className="flex items-center gap-3 py-3">
              <SmartImage src={p.images?.[0]?.url} alt="" loading="lazy" className="size-10 shrink-0 rounded-xl object-cover" fallbackLabel="" />
              <span className="min-w-0 flex-1">
                <Link to={`/admin/products/${p._id}/edit`} className="block truncate text-xs font-semibold hover:text-moss-700">{p.name}</Link>
                <span className="block text-2xs text-ink-400">
                  {[p.category?.name, p.weight != null ? `${toFa(p.weight)} ${p.unit || ''}`.trim() : null].filter(Boolean).join(' · ') || 'بدون دسته‌بندی'}
                </span>
                <span className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-bone-200">
                  <span
                    className={`block h-full rounded-full ${p.stock === 0 ? 'bg-berry-600' : 'bg-saffron-500'}`}
                    style={{ width: `${Math.min(100, Math.max(6, (p.stock / 40) * 100))}%` }}
                  />
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-0.5">
                <button
                  onClick={() => onAdjust(p, -5)}
                  disabled={busyId === String(p._id) || p.stock === 0}
                  className="grid size-10 place-items-center rounded-lg border hairline text-ink-500 transition-colors hover:border-moss-300 hover:text-moss-700 disabled:opacity-40"
                  aria-label="کاهش موجودی"
                >
                  <FiMinus size={13} />
                </button>
                <span className={`num w-12 text-center text-xs font-extrabold ${p.stock === 0 ? 'text-berry-600' : 'text-ink-900'}`}>
                  {p.stock === 0 ? 'ناموجود' : toFa(p.stock)}
                </span>
                <button
                  onClick={() => onAdjust(p, 5)}
                  disabled={busyId === String(p._id)}
                  className="grid size-10 place-items-center rounded-lg border hairline text-ink-500 transition-colors hover:border-moss-300 hover:text-moss-700 disabled:opacity-40"
                  aria-label="افزایش موجودی"
                >
                  <FiPlus size={13} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------- پرفروش‌ها و مشتریان ارزشمند ---------- */

export function Leaderboards({ topProducts, topCustomers, loading }) {
  const [tab, setTab] = useState('products');
  const rows = tab === 'products' ? topProducts : topCustomers;

  return (
    <section className="rounded-2xl border hairline bg-bone-50 p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold tracking-tight">صدرنشین‌ها</h2>
        <div className="flex rounded-xl border hairline bg-bone-100 p-0.5">
          {[['products', 'محصول'], ['customers', 'مشتری']].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`h-7 rounded-[0.55rem] px-3 text-2xs font-bold transition-colors ${tab === k ? 'bg-bone-50 text-moss-700 shadow-card' : 'text-ink-400 hover:text-ink-700'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <RowsSkeleton rows={4} /> : !rows?.length ? (
        <p className="py-10 text-center text-sm text-ink-400">داده‌ای برای نمایش نیست.</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {rows.map((r, i) => (
            <li key={r._id || i} className="flex items-center gap-3 text-xs">
              <span className="num grid size-6 shrink-0 place-items-center rounded-lg bg-moss-100 text-2xs font-bold text-moss-900">{toFa(i + 1)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{r.name}</span>
                <span className="num block text-2xs text-ink-400">
                  {tab === 'products' ? `${toFa(r.quantity)} فروش` : `${toFa(r.orders)} سفارش`}
                </span>
              </span>
              <span className="num shrink-0 font-bold text-ink-700">{shortToman(tab === 'products' ? r.revenue : r.spent)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/* ---------- خوراک فعالیت ---------- */

const FEED_ICON = {
  order: { icon: FiShoppingBag, cls: 'bg-moss-100 text-moss-900' },
  review: { icon: FiStar, cls: 'bg-saffron-50 text-saffron-600' },
  user: { icon: FiUserPlus, cls: 'bg-bone-200 text-ink-700' },
};

export function ActivityFeed({ items, loading }) {
  return (
    <section className="rounded-2xl border hairline bg-bone-50 p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold tracking-tight">فعالیت زنده</h2>
        <span className="flex items-center gap-1.5 text-2xs text-ink-400">
          <span className="size-1.5 rounded-full bg-moss-500 ring-4 ring-moss-100" /> هر دقیقه به‌روز می‌شود
        </span>
      </div>

      {loading ? <RowsSkeleton rows={4} /> : !items?.length ? (
        <p className="py-10 text-center text-sm text-ink-400">فعالیتی ثبت نشده است.</p>
      ) : (
        <ul className="mt-3 divide-y hairline">
          {items.map((a) => {
            const { icon: Icon, cls } = FEED_ICON[a.type] || FEED_ICON.user;
            return (
              <li key={`${a.type}-${a.id}`} className="flex items-start gap-3 py-2.5">
                <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${cls}`}><Icon size={13} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs leading-6">
                    {a.type === 'order' && <>سفارش <b className="num" dir="ltr">{a.title}</b> توسط {a.actor} · <span className="num">{toman(a.amount, { suffix: false })}</span></>}
                    {a.type === 'review' && <>{a.actor} برای <b>{a.title}</b> امتیاز <span className="num">{toFa(a.rating)}</span> ثبت کرد</>}
                    {a.type === 'user' && <><b>{a.actor}</b> در فروشگاه ثبت‌نام کرد</>}
                  </span>
                  <span className="block text-2xs text-ink-300">{relativeTime(a.at)}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ---------- دسترسی سریع ---------- */

const QUICK = [
  { to: '/admin/products/new', label: 'محصول جدید', hint: 'افزودن به کاتالوگ', icon: FiPlus },
  { to: '/admin/products?stock=low', label: 'اصلاح موجودی', hint: 'اقلام کم‌موجود', icon: FiBox },
  { to: '/admin/orders?status=PENDING', label: 'سفارش‌های در انتظار', hint: 'نیازمند تأیید', icon: FiShoppingBag },
  { to: '/admin/reviews', label: 'بازبینی نظرات', hint: 'نظرات تازه', icon: FiEdit3 },
  { to: '/admin/categories', label: 'دسته‌بندی‌ها', hint: 'ساختار فروشگاه', icon: FiPackage },
  { to: '/admin/users', label: 'مشتری‌ها', hint: 'مدیریت دسترسی', icon: FiUsers },
];

export function QuickActions({ badges }) {
  return (
    <section className="rounded-2xl border hairline bg-bone-50 p-5 shadow-card sm:p-6">
      <h2 className="text-base font-bold tracking-tight">دسترسی سریع</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {QUICK.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="flex items-center gap-3 rounded-xl border hairline p-3 transition-[transform,border-color,background-color] duration-200 ease-expo hover:-translate-y-0.5 hover:border-moss-300 hover:bg-moss-50"
          >
            <q.icon size={16} className="shrink-0 text-moss-600" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold">{q.label}</span>
              <span className="block text-2xs text-ink-400">{q.hint}</span>
            </span>
            {badges?.[q.to] > 0 && <span className="num chip bg-saffron-50 text-saffron-600">{toFa(badges[q.to])}</span>}
          </Link>
        ))}
      </div>
    </section>
  );
}
