import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiDownload, FiPlus, FiRefreshCw, FiSearch } from 'react-icons/fi';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Seo from '../../components/common/Seo.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { faDate, relativeTime, toFa } from '../../utils/format.js';
import { fillSeries, useDashboard, useOrderFeed } from './dashboard/useDashboard.js';
import {
  ActivityFeed, Leaderboards, Ledger, LowStockPanel, OrdersPanel, QuickActions, StatusMix, TrendChart,
} from './dashboard/Panels.jsx';

function exportCsv(points, days) {
  const rows = [['تاریخ', 'درآمد (تومان)', 'تعداد سفارش'], ...points.map((p) => [p.date, p.revenue, p.count])];
  const cell = (value) => `"${String(value ?? '').replaceAll('\"', '\"\"')}"`;
  const csv = `\uFEFF${rows.map((r) => r.map(cell).join(',')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `attari-sales-${days}d.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function Dashboard() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const dash = useDashboard(30);
  const feed = useOrderFeed(6);
  const [metric, setMetric] = useState('revenue');
  const [busyOrder, setBusyOrder] = useState(null);
  const [busyProduct, setBusyProduct] = useState(null);
  const [term, setTerm] = useState('');

  const { data, loading, error, lastError, refreshing, updatedAt, days, setDays, reload } = dash;
  const points = useMemo(() => fillSeries(data?.salesSeries, days), [data, days]);

  // Tab counts فقط از داده بازه‌ای (ordersByStatus)
  const tabCounts = useMemo(() => {
    const s = data?.ordersByStatus || {};
    const total = Object.values(s).reduce((a, b) => a + b, 0);
    return {
      all: total,
      PENDING: s.PENDING || 0,
      PROCESSING: s.PROCESSING || 0,
      SHIPPED: s.SHIPPED || 0,
    };
  }, [data]);

  const advance = async (order, next) => {
    setBusyOrder(String(order._id));
    feed.patch(order._id, next);
    try {
      await dash.advanceStatus(order, next);
      toast.success(`سفارش ${order.orderNumber} به‌روزرسانی شد`);
    } catch (err) {
      feed.patch(order._id, order.orderStatus);
      toast.error(err.message || 'تغییر وضعیت ممکن نشد');
    } finally {
      setBusyOrder(null);
    }
  };

  const adjust = async (product, delta) => {
    setBusyProduct(String(product._id));
    try {
      await dash.adjustStock(product, delta);
      const newStock = Math.max(0, product.stock + delta);
      toast.success(`موجودی «${product.name}» شد ${toFa(newStock)}`);
    } catch (err) {
      toast.error(err.message || 'ثبت موجودی ممکن نشد');
    } finally {
      setBusyProduct(null);
    }
  };

  const search = (e) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    navigate(q.startsWith('AT-') ? `/admin/orders?search=${encodeURIComponent(q)}` : `/admin/products?search=${encodeURIComponent(q)}`);
  };

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      <Seo title="داشبورد مدیریت" />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-moss-600">{faDate(new Date())}</p>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {user?.name ? `سلام ${user.name.split(' ')[0]}` : 'داشبورد'}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-3">
            <p className="text-sm text-ink-500">
              نبض فروشگاه در {days === 90 ? 'سه ماه' : `${toFa(days)} روز`} گذشته
            </p>
            {updatedAt && (
              <span className={`text-xs ${lastError ? 'text-berry-600' : 'text-ink-300'}`}>
                {lastError ? (
                  <>
                    <FiAlertTriangle className="inline" size={11} /> آخرین تلاش {relativeTime(updatedAt)} (خطا)
                  </>
                ) : (
                  <>آخرین به‌روزرسانی {relativeTime(updatedAt)}</>
                )}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={search} className="relative hidden lg:block">
            <FiSearch className="pointer-events-none absolute right-3.5 top-3 text-ink-300" size={16} />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="محصول یا شماره سفارش…"
              className="field h-10 w-64 pr-10 text-xs"
              aria-label="جست‌وجو در پنل مدیریت"
            />
          </form>
          <button
            onClick={() => reload({ silent: true })}
            disabled={refreshing}
            className="btn btn-outline btn-sm gap-1.5 text-xs"
            aria-label="تازه‌سازی داده‌ها"
          >
            <FiRefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'در حال دریافت…' : 'تازه‌سازی'}
          </button>
          <button
            onClick={() => { exportCsv(points, days); toast.info('فایل CSV فروش ساخته شد'); }}
            disabled={loading}
            className="btn btn-outline btn-sm gap-1.5 text-xs"
          >
            <FiDownload size={14} /> خروجی CSV
          </button>
          <button onClick={() => navigate('/admin/products/new')} className="btn btn-primary btn-sm gap-1.5 text-xs">
            <FiPlus size={15} /> محصول جدید
          </button>
        </div>
      </header>

      <Ledger data={data} points={points} loading={loading} />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <TrendChart
          points={points}
          days={days}
          onDays={setDays}
          loading={loading}
          metric={metric}
          onMetric={setMetric}
        />
        <div className="grid gap-6">
          <StatusMix ordersByStatus={data?.ordersByStatus} loading={loading} />
          <Leaderboards topProducts={data?.topProducts} topCustomers={data?.topCustomers} loading={loading} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <OrdersPanel feed={feed} counts={tabCounts} onAdvance={advance} busyId={busyOrder} />
        <LowStockPanel items={data?.lowStock || []} loading={loading} onAdjust={adjust} busyId={busyProduct} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ActivityFeed items={data?.activity} loading={loading} />
        <QuickActions
          badges={{
            '/admin/orders?status=PENDING': data?.ordersByStatus?.PENDING || 0,
            '/admin/products?stock=low': data?.counters?.lowStock || 0,
            '/admin/reviews': data?.counters?.weakReviews || 0,
          }}
        />
      </div>
    </>
  );
}
