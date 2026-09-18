import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiChevronLeft, FiPackage } from 'react-icons/fi';
import Badge from '../../components/ui/Badge.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { RowsSkeleton } from '../../components/ui/Skeleton.jsx';
import Seo from '../../components/common/Seo.jsx';
import { adminApi } from '../../services/endpoints.js';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE, faDate, toFa, toman } from '../../utils/format.js';

const FILTERS = [{ value: '', label: 'همه' }, ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }))];

export default function AdminOrders() {
  const [state, setState] = useState({ orders: null, meta: null });
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const search = params.get('search') || '';
  const [page, setPage] = useState(1);
  // فیلتر در URL می‌نشیند تا لینک‌های داشبورد مستقیم همین نما را باز کنند.
  const setStatus = (value) => {
    setParams(value ? { status: value } : {}, { replace: true });
    setPage(1);
  };

  useEffect(() => {
    setState((s) => ({ ...s, orders: null }));
    adminApi.orders({ page, limit: 15, status: status || undefined, search: search || undefined })
      .then(({ data }) => setState({ orders: data.orders, meta: data.meta }))
      .catch(() => setState({ orders: [], meta: null }));
  }, [page, status, search]);

  return (
    <>
      <Seo title="مدیریت سفارش‌ها" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">سفارش‌ها</h1>
          {state.meta && <p className="num mt-1.5 text-sm text-ink-500">{toFa(state.meta.total)} سفارش</p>}
        </div>
      </div>

      <div className="mt-6 flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatus(f.value); setPage(1); }}
            className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
              status === f.value ? 'bg-moss-700 text-bone-50' : 'bg-bone-50 text-ink-500 hover:bg-moss-50 hover:text-moss-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border hairline bg-bone-50">
        {state.orders === null ? (
          <div className="p-5"><RowsSkeleton rows={8} /></div>
        ) : state.orders.length === 0 ? (
          <EmptyState icon={FiPackage} title="سفارشی در این وضعیت نیست" description="فیلتر دیگری را امتحان کنید." />
        ) : (
          <ul className="divide-y hairline">
            {state.orders.map((o) => (
              <li key={o._id}>
                <Link to={`/admin/orders/${o._id}`} className="grid min-w-0 grid-cols-[1fr_auto] gap-x-3 gap-y-2 px-4 py-3.5 transition-colors hover:bg-moss-50/40 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
                  <span className="num truncate text-sm font-bold sm:min-w-[8rem]">{o.orderNumber}</span>
                  <Badge className={ORDER_STATUS_TONE[o.orderStatus]}>{ORDER_STATUS_LABELS[o.orderStatus]}</Badge>
                  <span className="min-w-0 sm:flex-1">
                    <span className="block truncate text-sm">{o.user?.name || 'کاربر حذف‌شده'}</span>
                    <span className="num block truncate text-2xs text-ink-400">{o.user?.phone} · {faDate(o.createdAt)}</span>
                  </span>
                  <span className="num self-end text-left text-sm font-bold sm:min-w-[7rem] sm:self-auto">{toman(o.total)}</span>
                  <span className="num text-xs text-ink-400 sm:order-none">{toFa(o.items.length)} قلم</span>
                  <FiChevronLeft className="hidden text-ink-300 sm:block" size={17} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Pagination page={state.meta?.page || 1} pages={state.meta?.pages || 1} onChange={setPage} />
    </>
  );
}
