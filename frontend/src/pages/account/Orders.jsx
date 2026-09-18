import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiPackage } from 'react-icons/fi';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { RowsSkeleton } from '../../components/ui/Skeleton.jsx';
import Seo from '../../components/common/Seo.jsx';
import { orderApi } from '../../services/endpoints.js';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE, faDate, toFa, toman } from '../../utils/format.js';
import SmartImage from '../../components/ui/SmartImage.jsx';

export default function Orders() {
  const [state, setState] = useState({ orders: null, meta: null });
  const [page, setPage] = useState(1);

  useEffect(() => {
    orderApi.mine({ page, limit: 8 }).then(({ data }) => setState({ orders: data.orders, meta: data.meta })).catch(() => setState({ orders: [], meta: null }));
  }, [page]);

  return (
    <>
      <Seo title="سفارش‌های من" />
      <h1 className="text-xl font-extrabold tracking-tight">سفارش‌های من</h1>

      {state.orders === null ? (
        <div className="mt-6"><RowsSkeleton rows={4} /></div>
      ) : state.orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border hairline bg-bone-100">
          <EmptyState icon={FiPackage} title="هنوز سفارشی ثبت نکرده‌اید" description="اولین سفارش شما همان روز ارسال می‌شود." action="مشاهده محصولات" to="/products" />
        </div>
      ) : (
        <>
          <ul className="mt-6 space-y-3">
            {state.orders.map((o) => (
              <li key={o._id}>
                <Link to={`/account/orders/${o._id}`} className="group flex flex-wrap items-center gap-4 rounded-2xl border hairline bg-bone-50 p-4 transition-colors hover:border-moss-300 hover:bg-moss-50/40">
                  <div className="flex -space-x-3 space-x-reverse">
                    {o.items.slice(0, 3).map((i, idx) => (
                      <SmartImage key={idx} src={i.image} alt="" loading="lazy" className="size-11 rounded-lg border-2 border-bone-50 object-cover" fallbackLabel="" />
                    ))}
                    {o.items.length > 3 && (
                      <span className="num grid size-11 place-items-center rounded-lg border-2 border-bone-50 bg-bone-200 text-2xs font-bold">
                        {toFa(o.items.length - 3)}+
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="num text-sm font-bold">{o.orderNumber}</p>
                    <p className="num mt-1 text-xs text-ink-400">{faDate(o.createdAt)} · {toFa(o.items.length)} قلم</p>
                  </div>

                  <Badge className={ORDER_STATUS_TONE[o.orderStatus]}>{ORDER_STATUS_LABELS[o.orderStatus]}</Badge>
                  <span className="num text-sm font-bold">{toman(o.total)}</span>
                  <FiChevronLeft className="text-ink-300 transition-transform duration-200 group-hover:-translate-x-1" size={18} />
                </Link>
              </li>
            ))}
          </ul>
          <Pagination page={state.meta?.page || 1} pages={state.meta?.pages || 1} onChange={setPage} />
        </>
      )}
    </>
  );
}
