import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowRight, FiUser } from 'react-icons/fi';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import { RowsSkeleton } from '../../components/ui/Skeleton.jsx';
import Seo from '../../components/common/Seo.jsx';
import { orderApi } from '../../services/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  ORDER_STATUS_LABELS, ORDER_STATUS_TONE, PAYMENT_LABELS, faDateTime, toFa, toman,
} from '../../utils/format.js';
import SmartImage from '../../components/ui/SmartImage.jsx';

const FLOW = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => orderApi.get(id).then(({ data }) => setOrder(data.order)).catch((e) => setError(e.message));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const change = async () => {
    setBusy(true);
    try {
      const { data, message } = await orderApi.updateStatus(id, pending);
      setOrder(data.order);
      toast.success(message);
      setPending(null);
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!order) return <RowsSkeleton rows={6} />;

  const nextStates = FLOW[order.orderStatus] || [];

  return (
    <>
      <Seo title={`سفارش ${order.orderNumber}`} />
      <Link to="/admin/orders" className="mb-5 inline-flex items-center gap-2 text-sm text-ink-500 hover:text-moss-700">
        <FiArrowRight size={16} /> بازگشت به سفارش‌ها
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="num text-xl font-extrabold tracking-tight sm:text-2xl">{order.orderNumber}</h1>
          <p className="num mt-1.5 text-xs text-ink-400">{faDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={ORDER_STATUS_TONE[order.orderStatus]}>{ORDER_STATUS_LABELS[order.orderStatus]}</Badge>
          <Badge tone={order.paymentStatus === 'PAID' ? 'moss' : 'neutral'}>{PAYMENT_LABELS[order.paymentStatus]}</Badge>
        </div>
      </div>

      {nextStates.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border hairline bg-bone-50 p-4">
          <span className="text-sm font-semibold">تغییر وضعیت به:</span>
          {nextStates.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={s === 'CANCELLED' ? 'outline' : 'primary'}
              className={s === 'CANCELLED' ? 'text-berry-600' : ''}
              onClick={() => setPending(s)}
            >
              {ORDER_STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
      )}

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="rounded-2xl border hairline bg-bone-50 p-5">
          <h2 className="text-base font-bold">کالاها</h2>
          <ul className="mt-4 divide-y hairline">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex items-center gap-3 py-3">
                <SmartImage src={i.image} alt="" loading="lazy" className="size-12 rounded-lg object-cover" fallbackLabel="" />
                <span className="min-w-0 flex-1">
                  <Link to={`/products/${i.slug}`} className="block truncate text-sm font-medium hover:text-moss-700">{i.name}</Link>
                  <span className="num text-2xs text-ink-400">{toFa(i.quantity)} × {toman(i.unitPrice)}</span>
                </span>
                <span className="num text-sm font-bold">{toman(i.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t hairline pt-4 text-sm">
            {[
              ['جمع کالاها', toman(order.subtotal)],
              ...(order.discount ? [['تخفیف', `${toman(order.discount)} −`]] : []),
              ['ارسال', order.shippingCost ? toman(order.shippingCost) : 'رایگان'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between"><dt className="text-ink-400">{k}</dt><dd className="num">{v}</dd></div>
            ))}
            <div className="flex justify-between border-t hairline pt-2.5"><dt className="font-bold">مبلغ کل</dt><dd className="num font-extrabold">{toman(order.total)}</dd></div>
          </dl>
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border hairline bg-bone-50 p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold"><FiUser size={15} className="text-moss-600" /> مشتری</h2>
            <p className="num mt-3 text-xs leading-6 text-ink-500">
              {order.user?.name}<br />{order.user?.phone}<br />{order.user?.email}
            </p>
            <Link to={`/admin/users?search=${order.user?.email || ''}`} className="mt-3 inline-block text-xs font-semibold text-moss-700 hover:underline">پروفایل کاربر</Link>
          </section>

          <section className="rounded-2xl border hairline bg-bone-50 p-5">
            <h2 className="text-sm font-bold">آدرس تحویل</h2>
            <p className="mt-3 text-xs leading-6 text-ink-500">
              {order.shippingAddress.province}، {order.shippingAddress.city}<br />{order.shippingAddress.line}
              <span className="num mt-2 block text-ink-400">
                {order.shippingAddress.receiver} · {order.shippingAddress.phone}<br />کد پستی {order.shippingAddress.postalCode}
              </span>
              {order.shippingAddress.note && <span className="mt-2 block text-saffron-600">یادداشت: {order.shippingAddress.note}</span>}
            </p>
          </section>

          <section className="rounded-2xl border hairline bg-bone-50 p-5">
            <h2 className="text-sm font-bold">تاریخچه وضعیت</h2>
            <ol className="mt-3 space-y-2.5">
              {order.statusHistory?.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-moss-600" />
                  <span>
                    <span className="font-semibold">{ORDER_STATUS_LABELS[h.status] || h.status}</span>
                    <span className="num mt-0.5 block text-ink-400">{faDateTime(h.at)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pending)} onClose={() => setPending(null)} onConfirm={change} loading={busy}
        danger={pending === 'CANCELLED'}
        title={`تغییر وضعیت به «${ORDER_STATUS_LABELS[pending] || ''}»`}
        description={pending === 'CANCELLED' ? 'سفارش لغو و موجودی کالاها به انبار برگردانده می‌شود.' : 'مشتری از این تغییر مطلع می‌شود.'}
        confirmText="اعمال کن"
      />
    </>
  );
}
