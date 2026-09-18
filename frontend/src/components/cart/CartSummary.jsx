import { FiTruck } from 'react-icons/fi';
import { toFa, toman } from '../../utils/format.js';

const Row = ({ label, value, tone }) => (
  <div className="flex items-center justify-between py-2 text-sm">
    <span className="text-ink-500">{label}</span>
    <span className={`num font-medium ${tone || 'text-ink-900'}`}>{value}</span>
  </div>
);

export default function CartSummary({ cart, children, showShippingBar = true }) {
  const remaining = Math.max(0, (cart.freeShippingThreshold || 0) - cart.subtotal);
  const progress = cart.freeShippingThreshold ? Math.min(100, (cart.subtotal / cart.freeShippingThreshold) * 100) : 100;

  return (
    <div className="rounded-2xl border hairline bg-bone-100 p-5 sm:p-6">
      <h2 className="text-base font-bold">صورت‌حساب</h2>

      <div className="mt-4 divide-y hairline">
        <Row label={`کالاها (${toFa(cart.itemsCount)})`} value={toman(cart.grossSubtotal ?? cart.subtotal)} />
        {cart.discount > 0 && <Row label="تخفیف محصولات" value={`${toman(cart.discount)} −`} tone="text-berry-600" />}
        <Row label="هزینه ارسال" value={cart.shippingCost === 0 ? 'رایگان' : toman(cart.shippingCost)} tone={cart.shippingCost === 0 ? 'text-moss-700' : ''} />
      </div>

      <div className="mt-4 flex items-baseline justify-between border-t-2 border-ink-900/10 pt-4">
        <span className="text-sm font-semibold">مبلغ قابل پرداخت</span>
        <span className="num text-xl font-extrabold">{toman(cart.total)}</span>
      </div>

      {showShippingBar && remaining > 0 && (
        <div className="mt-5 rounded-xl bg-bone-50 p-3.5">
          <p className="num flex items-center gap-2 text-xs text-ink-500">
            <FiTruck size={15} className="text-moss-600" />
            {toman(remaining)} تا ارسال رایگان بالای یک میلیون تومان
          </p>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-bone-200">
            <div className="h-full rounded-full bg-moss-600 transition-[width] duration-500 ease-quart" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {children && <div className="mt-5 space-y-2.5">{children}</div>}
    </div>
  );
}
