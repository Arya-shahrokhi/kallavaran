import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cartApi } from '../services/endpoints.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

/**
 * دو کانتکست جدا، عمداً:
 *
 *  - CartDataContext  : داده‌ی سبد، با هر افزودن/حذف عوض می‌شود.
 *  - CartActionsContext: توابع، هرگز عوض نمی‌شوند (مرجع پایدار).
 *
 * قبلاً یک کانتکست بود و مقدارش شامل هم `cart` و هم توابع؛ نتیجه این بود
 * که با هر تغییر سبد، *همه‌ی* کارت‌های محصول در گرید دوباره رندر می‌شدند
 * (memo هم جلویش را نمی‌گیرد، چون کانتکست از بالای memo رد می‌شود).
 * حالا ProductCard فقط به actions وصل است، پس افزودن یک کالا فقط همان
 * کارت را به‌روز می‌کند، نه ۱۲ کارت دیگر را.
 */
const CartDataContext = createContext(null);
const CartActionsContext = createContext(null);

const EMPTY = {
  items: [], itemsCount: 0, grossSubtotal: 0, subtotal: 0,
  discount: 0, shippingCost: 0, total: 0, freeShippingThreshold: 0,
};

/** داده + توابع، برای صفحه‌هایی که هر دو را می‌خواهند (سبد، پرداخت). */
export const useCart = () => ({ ...useContext(CartDataContext), ...useContext(CartActionsContext) });

/** فقط توابع پایدار: برای کارت محصول و دکمه‌های «افزودن به سبد». */
export const useCartActions = () => useContext(CartActionsContext);

/** فقط داده: برای نشان‌گر تعداد در هدر و صورت‌حساب. */
export const useCartData = () => useContext(CartDataContext);

export function CartProvider({ children }) {
  const { user, booting } = useAuth();
  const toast = useToast();

  const [cart, setCart] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // برای آنکه توابع لازم نباشد به toast وابسته باشند و مرجع‌شان عوض شود
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const refresh = useCallback(async () => {
    try {
      const { data } = await cartApi.get();
      setCart(data.cart);
      if (data.cart.removedCount > 0) {
        toastRef.current.info('چند کالای ناموجود از سبد شما حذف شد');
      }
    } catch {
      setCart(EMPTY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (!booting) refresh(); }, [booting, user?._id, refresh]);

  const run = useCallback(async (fn, id, successMessage) => {
    setPendingId(id);
    try {
      const { data, message } = await fn();
      setCart(data.cart);
      if (successMessage !== false) toastRef.current.success(successMessage || message);
      return true;
    } catch (err) {
      toastRef.current.error(err.message);
      return false;
    } finally {
      setPendingId(null);
    }
  }, []);

  /**
   * مرجع این آبجکت هیچ‌وقت عوض نمی‌شود، چون هیچ dependency متغیری ندارد.
   * این همان چیزی است که رندرهای زنجیره‌ای را قطع می‌کند.
   */
  const actions = useMemo(() => ({
    refresh,
    addItem: async (productId, qty = 1, { openDrawer = true } = {}) => {
      const okAdd = await run(() => cartApi.add(productId, qty), productId, 'به سبد خرید اضافه شد');
      // بازخورد فوری: کشوی سبد باز می‌شود، کاربر لازم نیست صفحه عوض کند
      if (okAdd && openDrawer) setDrawerOpen(true);
      return okAdd;
    },
    updateItem: (itemId, qty) => run(() => cartApi.update(itemId, qty), itemId, false),
    removeItem: (itemId) => run(() => cartApi.remove(itemId), itemId, 'از سبد حذف شد'),
    clear: () => run(() => cartApi.clear(), 'all', 'سبد خرید خالی شد'),
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  }), [refresh, run]);

  const data = useMemo(
    () => ({ cart, loading, pendingId, drawerOpen }),
    [cart, loading, pendingId, drawerOpen],
  );

  return (
    <CartActionsContext.Provider value={actions}>
      <CartDataContext.Provider value={data}>{children}</CartDataContext.Provider>
    </CartActionsContext.Provider>
  );
}
