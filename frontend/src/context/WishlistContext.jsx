import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { wishlistApi } from '../services/endpoints.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

/** همان الگوی سبد: مجموعه‌ی شناسه‌ها جدا از توابع، تا رندر اضافه نداشته باشیم. */
const WishlistDataContext = createContext(null);
const WishlistActionsContext = createContext(null);

export const useWishlist = () => ({ ...useContext(WishlistDataContext), ...useContext(WishlistActionsContext) });
export const useWishlistActions = () => useContext(WishlistActionsContext);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const authRef = useRef(isAuthenticated);
  useEffect(() => { authRef.current = isAuthenticated; }, [isAuthenticated]);

  const refresh = useCallback(async () => {
    if (!authRef.current) { setProducts([]); return; }
    setLoading(true);
    try {
      const { data } = await wishlistApi.get();
      setProducts(data.products);
    } catch { /* بی‌صدا */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [isAuthenticated, refresh]);

  const ids = useMemo(() => new Set(products.map((p) => p._id)), [products]);
  const idsRef = useRef(ids);
  useEffect(() => { idsRef.current = ids; }, [ids]);

  const actions = useMemo(() => ({
    refresh,
    toggle: async (productId) => {
      if (!authRef.current) {
        toastRef.current.info('برای ذخیره علاقه‌مندی‌ها وارد حساب خود شوید');
        return false;
      }
      // به‌روزرسانی خوش‌بینانه: عمل کم‌ریسک است
      const wasIn = idsRef.current.has(productId);
      setProducts((list) => (wasIn ? list.filter((p) => p._id !== productId) : list));
      try {
        const { data, message } = await wishlistApi.toggle(productId);
        setProducts(data.products);
        toastRef.current.success(message);
        return data.added;
      } catch (err) {
        toastRef.current.error(err.message);
        refresh();
        return wasIn;
      }
    },
  }), [refresh]);

  const data = useMemo(
    () => ({ products, ids, loading, has: (id) => ids.has(id) }),
    [products, ids, loading],
  );

  return (
    <WishlistActionsContext.Provider value={actions}>
      <WishlistDataContext.Provider value={data}>{children}</WishlistDataContext.Provider>
    </WishlistActionsContext.Provider>
  );
}
