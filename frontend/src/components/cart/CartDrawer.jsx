import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiShoppingBag, FiTrash2, FiTruck, FiX } from 'react-icons/fi';
import QuantityStepper from '../ui/QuantityStepper.jsx';
import Spinner from '../ui/Spinner.jsx';
import SmartImage from '../ui/SmartImage.jsx';
import { useCartActions, useCartData } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLockBody } from '../../hooks/index.js';
import { toFa, toman } from '../../utils/format.js';

/**
 * کشوی سبد خرید: بعد از «افزودن به سبد» باز می‌شود.
 *
 * چرا: قبلاً افزودن به سبد فقط یک toast کوچک نشان می‌داد و کاربر برای دیدن
 * سبد باید صفحه عوض می‌کرد. حالا بدون ترک صفحه‌ی فعلی می‌تواند سبد را ببیند،
 * تعداد را عوض کند یا کالا را حذف کند.
 */
export default function CartDrawer() {
  const { cart, loading, pendingId, drawerOpen } = useCartData();
  const { closeDrawer, updateItem, removeItem } = useCartActions();
  const { isAuthenticated } = useAuth();

  useLockBody(drawerOpen);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') closeDrawer(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  const remaining = Math.max(0, (cart.freeShippingThreshold || 0) - cart.subtotal);
  const progress = cart.freeShippingThreshold
    ? Math.min(100, (cart.subtotal / cart.freeShippingThreshold) * 100)
    : 100;

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="سبد خرید">
      <button className="absolute inset-0 bg-ink-900/50 animate-fade-in" onClick={closeDrawer} aria-label="بستن سبد خرید" />

      <div className="cart-drawer absolute inset-y-0 left-0 flex w-[26rem] max-w-[92vw] flex-col bg-bone-50 shadow-pop animate-slide-in-left">
        <header className="cart-drawer-header flex items-center justify-between border-b hairline px-5 pb-4">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <FiShoppingBag size={18} className="text-moss-700" />
            سبد خرید
            {cart.itemsCount > 0 && <span className="num text-sm font-medium text-ink-400">({toFa(cart.itemsCount)})</span>}
          </h2>
          <button onClick={closeDrawer} aria-label="بستن" className="rounded-xl p-2 text-ink-400 transition-colors hover:bg-bone-200 hover:text-ink-900">
            <FiX size={19} />
          </button>
        </header>

        {/* نوار پیشرفت ارسال رایگان: انگیزه‌ی روشن برای افزودن یک قلم دیگر */}
        {cart.items.length > 0 && remaining > 0 && (
          <div className="border-b hairline bg-moss-50 px-5 py-3">
            <p className="num flex items-center gap-2 text-xs text-moss-900">
              <FiTruck size={15} />
              {toman(remaining)} تا ارسال رایگان بالای یک میلیون تومان
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bone-200">
              <div className="h-full rounded-full bg-moss-600 transition-[width] duration-500 ease-quart" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        {cart.items.length > 0 && remaining === 0 && (
          <p className="border-b hairline bg-moss-100 px-5 py-3 text-xs font-semibold text-moss-900">
            <FiTruck size={15} className="ml-1 inline" /> ارسال این سفارش رایگان است
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          {loading ? (
            <div className="grid h-full place-items-center text-moss-600"><Spinner size={26} /></div>
          ) : cart.items.length === 0 ? (
            <div className="grid h-full place-items-center py-10 text-center">
              <div>
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-bone-100 text-ink-300">
                  <FiShoppingBag size={24} />
                </span>
                <p className="mt-4 text-sm font-semibold">سبد خرید شما خالی است</p>
                <p className="mx-auto mt-1.5 max-w-[26ch] text-xs leading-6 text-ink-400">
                  از دمنوش‌ها شروع کنید؛ پیشنهاد ما دمنوش آرامش شب است.
                </p>
                <Link to="/products" onClick={closeDrawer} className="btn-primary btn-sm mt-5 gap-2">
                  شروع خرید <FiArrowLeft size={15} />
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y hairline">
              {cart.items.map((item) => {
                const busy = pendingId === item._id;
                return (
                  <li key={item._id} className={`flex gap-3 py-4 transition-opacity ${busy ? 'opacity-50' : ''}`}>
                    <Link to={`/products/${item.product.slug}`} onClick={closeDrawer} className="shrink-0">
                      <SmartImage
                        src={item.product.image}
                        alt={item.product.name}
                        loading="lazy"
                        width="72" height="90"
                        sizes="72px"
                        className="size-[4.5rem] rounded-xl object-cover"
                        fallbackLabel=""
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/products/${item.product.slug}`}
                          onClick={closeDrawer}
                          className="line-clamp-2 text-sm font-semibold leading-6 hover:text-moss-700"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item._id)}
                          disabled={busy}
                          aria-label={`حذف ${item.product.name}`}
                          className="shrink-0 rounded-lg p-1.5 text-ink-300 transition-colors hover:bg-berry-100 hover:text-berry-600"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>

                      <div className="mt-auto flex items-end justify-between gap-2">
                        <QuantityStepper
                          size="sm"
                          value={item.quantity}
                          max={Math.min(50, item.product.stock)}
                          disabled={busy}
                          onChange={(q) => updateItem(item._id, q)}
                        />
                        <p className="num text-sm font-bold">{toman(item.lineTotal, { suffix: false })}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {cart.items.length > 0 && (
          <footer className="cart-drawer-footer border-t hairline bg-bone-100 px-5 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">جمع کالاها</span>
              <span className="num font-medium">{toman(cart.subtotal)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="mt-1.5 flex items-center justify-between text-sm">
                <span className="text-ink-500">تخفیف</span>
                <span className="num font-medium text-berry-600">{toman(cart.discount)} −</span>
              </div>
            )}
            <div className="mt-2.5 flex items-baseline justify-between border-t border-ink-900/10 pt-2.5">
              <span className="text-sm font-semibold">قابل پرداخت</span>
              <span className="num text-lg font-extrabold">{toman(cart.total)}</span>
            </div>

            <div className="mt-4 space-y-2">
              <Link
                to={isAuthenticated ? '/checkout' : '/login?redirect=/checkout'}
                onClick={closeDrawer}
                className="btn-primary btn-md w-full"
              >
                {isAuthenticated ? 'ادامه و ثبت سفارش' : 'ورود و ثبت سفارش'}
              </Link>
              <Link to="/cart" onClick={closeDrawer} className="btn-ghost btn-sm w-full">
                مشاهده‌ی کامل سبد
              </Link>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
