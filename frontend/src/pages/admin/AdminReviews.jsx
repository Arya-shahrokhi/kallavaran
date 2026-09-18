import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageSquare, FiTrash2 } from 'react-icons/fi';
import Rating from '../../components/ui/Rating.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import { RowsSkeleton } from '../../components/ui/Skeleton.jsx';
import Seo from '../../components/common/Seo.jsx';
import { adminApi } from '../../services/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';
import { faDate, toFa } from '../../utils/format.js';

export default function AdminReviews() {
  const toast = useToast();
  const [state, setState] = useState({ reviews: null, meta: null });
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setState((s) => ({ ...s, reviews: null }));
    adminApi.reviews({ page, limit: 15 })
      .then(({ data }) => setState({ reviews: data.reviews, meta: data.meta }))
      .catch(() => setState({ reviews: [], meta: null }));
  };
  useEffect(load, [page]);

  const remove = async () => {
    setBusy(true);
    try {
      await adminApi.removeReview(target._id);
      toast.success('نظر حذف شد');
      setTarget(null);
      load();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <>
      <Seo title="مدیریت نظرات" />
      <div>
        <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">نظرات</h1>
        {state.meta && <p className="num mt-1.5 text-sm text-ink-500">{toFa(state.meta.total)} نظر ثبت‌شده</p>}
      </div>

      {state.reviews === null ? (
        <div className="mt-6 rounded-2xl border hairline bg-bone-50 p-5"><RowsSkeleton rows={6} /></div>
      ) : state.reviews.length === 0 ? (
        <div className="mt-6 rounded-2xl border hairline bg-bone-50">
          <EmptyState icon={FiMessageSquare} title="نظری ثبت نشده" description="پس از خرید مشتریان، نظرها اینجا می‌آید." />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {state.reviews.map((r) => (
            <li key={r._id} className="rounded-2xl border hairline bg-bone-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-sm font-bold">{r.user?.name || 'کاربر حذف‌شده'}</span>
                    <Rating value={r.rating} showValue={false} size={13} />
                    <span className="num text-2xs text-ink-400">{faDate(r.createdAt)}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-ink-400">
                    روی{' '}
                    <Link to={`/products/${r.product?.slug}`} className="font-medium text-moss-700 hover:underline">{r.product?.name || 'محصول حذف‌شده'}</Link>
                  </p>
                </div>
                <button onClick={() => setTarget(r)} aria-label="حذف نظر" className="rounded-lg p-2 text-ink-400 hover:bg-berry-100 hover:text-berry-600">
                  <FiTrash2 size={16} />
                </button>
              </div>
              {r.title && <p className="mt-3 text-sm font-semibold">{r.title}</p>}
              <p className="mt-1.5 max-w-[80ch] text-sm leading-7 text-ink-500">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={state.meta?.page || 1} pages={state.meta?.pages || 1} onChange={setPage} />

      <ConfirmDialog
        open={Boolean(target)} onClose={() => setTarget(null)} onConfirm={remove} loading={busy}
        title="حذف نظر" description="نظر برای همیشه حذف و امتیاز محصول بازمحاسبه می‌شود." confirmText="حذف کن"
      />
    </>
  );
}
