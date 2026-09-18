import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowRight, FiMapPin } from 'react-icons/fi';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { RowsSkeleton } from '../../components/ui/Skeleton.jsx';
import Seo from '../../components/common/Seo.jsx';
import { orderApi } from '../../services/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  ORDER_STATUS_LABELS, ORDER_STATUS_TONE, PAYMENT_LABELS, faDateTime, toFa, toman,
} from '../../utils/format.js';
import SmartImage from '../../components/ui/SmartImage.jsx';

const STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function OrderDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () => orderApi.get(id).then(({ data }) => setOrder(data.order)).catch((e) => setError(e.message));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const cancel = async () => {
    setBusy(true);
    try {
      const { data, message } = await orderApi.cancel(id);
      setOrder(data.order);
      toast.success(message);
      setConfirm(false);
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!order) return <RowsSkeleton rows={5} />;

  const cancelled = order.orderStatus === 'CANCELLED';
  const stepIndex = STEPS.indexOf(order.orderStatus);
  const canCancel = ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus);

  return (
    <>
      <Seo title={`سفارش ${order.orderNumber}`} />

      <Link to="/account/orders" className="mb-5 inline-flex items-center gap-2 text-sm text-ink-500 hover:text-moss-700">
        <FiArrowRight size={16} /> بازگشت به سفارش‌ها
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="num text-xl font-extrabold tracking-tight">سفارش {order.orderNumber}</h1>
          <p className="num mt-1.5 text-xs text-ink-400">ثبت در {faDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={ORDER_STATUS_TONE[order.orderStatus]}>{ORDER_STATUS_LABELS[order.orderStatus]}</Badge>
          <Badge tone="neutral">{PAYMENT_LABELS[order.paymentStatus]}</Badge>
        </div>
      </div>

      {!cancelled && (
        <ol className="mt-8 flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= stepIndex ? 'bg-moss-600' : 'bg-bone-200'}`} />
              <p className={`mt-2 text-[0.65rem] leading-4 sm:text-2xs ${i <= stepIndex ? 'font-semibold text-moss-900' : 'text-ink-300'}`}>
                {ORDER_STATUS_LABELS[s]}
              </p>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          <h2 className="text-base font-bold">کالاها</h2>
          <ul className="mt-3 divide-y hairline">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex items-center gap-3 py-3.5">
                <SmartImage src={i.image} alt="" loading="lazy" className="size-14 rounded-xl object-cover" fallbackLabel="" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    <Link to={`/products/${i.slug}`} className="hover:text-moss-700">{i.name}</Link>
                  </p>
                  <p className="num mt-1 text-xs text-ink-400">{toFa(i.quantity)} × {toman(i.unitPrice)}</p>
                </div>
                <span className="num text-sm font-bold">{toman(i.lineTotal)}</span>
              </li>
            ))}
          </ul>

          {canCancel && (
            <Button variant="outline" size="sm" className="mt-6 text-berry-600" onClick={() => setConfirm(true)}>لغو سفارش</Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border hairline bg-bone-100 p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold"><FiMapPin size={15} className="text-moss-600" /> آدرس تحویل</h2>
            <p className="mt-3 text-xs leading-6 text-ink-500">
              {order.shippingAddress.province}، {order.shippingAddress.city}
              <br />{order.shippingAddress.line}
              <span className="num mt-2 block text-ink-400">
                {order.shippingAddress.receiver} · {order.shippingAddress.phone}
                <br />کد پستی {order.shippingAddress.postalCode}
              </span>
              {order.shippingAddress.note && <span className="mt-2 block text-saffron-600">یادداشت: {order.shippingAddress.note}</span>}
            </p>
          </div>

          <div className="rounded-2xl border hairline bg-bone-100 p-5">
            <h2 className="text-sm font-bold">صورت‌حساب</h2>
            <dl className="mt-3 space-y-2 text-xs">
              {[
                ['جمع کالاها', toman(order.subtotal)],
                ...(order.discount ? [['تخفیف', `${toman(order.discount)} −`]] : []),
                ['ارسال', order.shippingCost ? toman(order.shippingCost) : 'رایگان'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-ink-400">{k}</dt><dd className="num font-medium">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t hairline pt-2.5 text-sm">
                <dt className="font-semibold">مبلغ کل</dt><dd className="num font-extrabold">{toman(order.total)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirm} onClose={() => setConfirm(false)} onConfirm={cancel} loading={busy}
        title="لغو سفارش" description="سفارش لغو می‌شود و موجودی کالاها به انبار برمی‌گردد." confirmText="لغو کن"
      />
    </>
  );
}
