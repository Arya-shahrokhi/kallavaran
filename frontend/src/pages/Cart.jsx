import { Link } from 'react-router-dom';
import { FiArrowLeft, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import CartItem from '../components/cart/CartItem.jsx';
import CartSummary from '../components/cart/CartSummary.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { RowsSkeleton } from '../components/ui/Skeleton.jsx';
import Seo from '../components/common/Seo.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';
import { toFa } from '../utils/format.js';

export default function Cart() {
  const { cart, loading, clear } = useCart();
  const { isAuthenticated } = useAuth();
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <Seo title="سبد خرید" description="بازبینی سبد خرید و ادامه فرآیند پرداخت." />

      <div className="wrap py-9 sm:py-12">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">سبد خرید</h1>

        {loading ? (
          <div className="mt-8 max-w-2xl"><RowsSkeleton rows={3} /></div>
        ) : cart.items.length === 0 ? (
          <div className="mt-6 rounded-3xl border hairline bg-bone-100">
            <EmptyState
              icon={FiShoppingBag}
              title="سبد خرید شما خالی است"
              description="از میان گیاهان دارویی، ادویه‌ها و دمنوش‌ها شروع کنید. پیشنهاد ما: دمنوش آرامش شب."
              action="شروع خرید"
              to="/products"
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_23rem]">
            <div>
              <div className="flex items-center justify-between border-b hairline pb-3">
                <p className="num text-sm text-ink-500">{toFa(cart.itemsCount)} کالا در سبد</p>
                <button onClick={() => setConfirm(true)} className="flex items-center gap-1.5 text-xs text-ink-400 transition-colors hover:text-berry-600">
                  <FiTrash2 size={14} /> خالی کردن سبد
                </button>
              </div>

              <div className="divide-y hairline">
                {cart.items.map((item) => <CartItem key={item._id} item={item} />)}
              </div>

              <Link to="/products" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-moss-700 hover:text-moss-900">
                <FiArrowLeft size={16} /> ادامه خرید
              </Link>
            </div>

            <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
              <CartSummary cart={cart}>
                <Button to={isAuthenticated ? '/checkout' : '/login?redirect=/checkout'} size="lg" className="w-full">
                  {isAuthenticated ? 'ادامه و ثبت سفارش' : 'ورود و ثبت سفارش'}
                </Button>
                <p className="text-center text-2xs leading-6 text-ink-400">
                  با ثبت سفارش، <Link to="/terms" className="text-moss-700 underline">قوانین فروشگاه</Link> را می‌پذیرید.
                </p>
              </CartSummary>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={async () => { await clear(); setConfirm(false); }}
        title="خالی کردن سبد خرید"
        description="همه کالاهای سبد حذف می‌شوند. علاقه‌مندی‌های شما دست‌نخورده می‌ماند."
        confirmText="خالی کن"
      />
    </>
  );
}
