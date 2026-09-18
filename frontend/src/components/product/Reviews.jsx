import { useEffect, useState } from 'react';
import { FiMessageSquare, FiTrash2 } from 'react-icons/fi';
import Rating from '../ui/Rating.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { RowsSkeleton } from '../ui/Skeleton.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { adminApi, productApi } from '../../services/endpoints.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useSubmit } from '../../hooks/index.js';
import { relativeTime, toFa } from '../../utils/format.js';

export default function Reviews({ productId, onRatingChange }) {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [reviews, setReviews] = useState(null);
  const [form, setForm] = useState({ rating: 0, title: '', comment: '' });
  const [errors, setErrors] = useState({});
  const [confirmId, setConfirmId] = useState(null);

  const load = () => productApi.reviews(productId).then(({ data }) => setReviews(data.reviews)).catch(() => setReviews([]));

  useEffect(() => { setReviews(null); load(); /* eslint-disable-next-line */ }, [productId]);

  const [submit, submitting] = useSubmit(async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.rating) next.rating = 'امتیاز را انتخاب کنید';
    if (form.comment.trim().length < 5) next.comment = 'متن نظر حداقل ۵ کاراکتر باشد';
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      await productApi.addReview(productId, { rating: form.rating, title: form.title || undefined, comment: form.comment.trim() });
      toast.success('نظر شما ثبت شد. ممنون که تجربه‌تان را نوشتید.');
      setForm({ rating: 0, title: '', comment: '' });
      load();
      onRatingChange?.();
    } catch (err) {
      toast.error(err.message);
      if (err.details) setErrors(err.details);
    }
  });

  const remove = async () => {
    try {
      await adminApi.removeReview(confirmId);
      toast.success('نظر حذف شد');
      setConfirmId(null);
      load();
      onRatingChange?.();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_22rem]">
      <div>
        <h2 className="text-lg font-bold">نظر خریداران</h2>

        {reviews === null ? (
          <div className="mt-6"><RowsSkeleton rows={3} /></div>
        ) : reviews.length === 0 ? (
          <EmptyState icon={FiMessageSquare} title="هنوز نظری ثبت نشده" description="اگر این محصول را خریده‌اید، تجربه‌تان برای بقیه ارزش دارد." />
        ) : (
          <ul className="mt-6 divide-y hairline">
            {reviews.map((r) => (
              <li key={r._id} className="py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-moss-100 text-sm font-bold text-moss-900">
                      {r.user?.name?.charAt(0) || '؟'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{r.user?.name || 'کاربر حذف‌شده'}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Rating value={r.rating} showValue={false} size={13} />
                        <span className="text-2xs text-ink-400">{relativeTime(r.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {(user?.role === 'ADMIN' || user?._id === r.user?._id) && (
                    <button onClick={() => setConfirmId(r._id)} aria-label="حذف نظر" className="rounded-lg p-2 text-ink-300 hover:bg-berry-100 hover:text-berry-600">
                      <FiTrash2 size={15} />
                    </button>
                  )}
                </div>
                {r.title && <p className="mt-3 text-sm font-semibold">{r.title}</p>}
                <p className="mt-2 max-w-[68ch] text-sm leading-7 text-ink-500">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <div className="rounded-2xl border hairline bg-bone-100 p-5">
          <h3 className="text-base font-bold">نظر خود را بنویسید</h3>
          {!isAuthenticated ? (
            <>
              <p className="mt-2 text-sm leading-7 text-ink-500">برای ثبت نظر باید وارد حساب خود شوید.</p>
              <Button to="/login" size="sm" className="mt-4 w-full">ورود به حساب</Button>
            </>
          ) : (
            <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
              <div>
                <span className="label">امتیاز شما</span>
                <Rating value={form.rating} interactive size={24} showValue={false} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
                {errors.rating && <p className="mt-1.5 text-xs text-berry-600">{errors.rating}</p>}
              </div>
              <Input label="عنوان (اختیاری)" value={form.title} maxLength={120} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              <div>
                <label className="label" htmlFor="review-comment">متن نظر</label>
                <textarea
                  id="review-comment" rows={4} maxLength={1500} value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder="کیفیت، بسته‌بندی، عطر و تجربه مصرف را بنویسید"
                  className={`field h-auto resize-none py-3 leading-7 ${errors.comment ? 'field-error' : ''}`}
                />
                <div className="mt-1.5 flex items-center justify-between">
                  {errors.comment ? <p className="text-xs text-berry-600">{errors.comment}</p> : <span />}
                  <span className="num text-2xs text-ink-300">{toFa(form.comment.length)}/{toFa(1500)}</span>
                </div>
              </div>
              <Button type="submit" size="md" loading={submitting} className="w-full">ثبت نظر</Button>
            </form>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmId)}
        onClose={() => setConfirmId(null)}
        onConfirm={remove}
        title="حذف نظر"
        description="این نظر برای همیشه حذف می‌شود."
        confirmText="حذف کن"
      />
    </div>
  );
}
