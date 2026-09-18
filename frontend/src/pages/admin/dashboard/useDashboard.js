import { useCallback, useEffect, useRef, useState } from 'react';
import { adminApi, orderApi, productApi } from '../../../services/endpoints.js';

const REFRESH_MS = 60000;

export function useDashboard(initialDays = 30) {
  const [days, setDays] = useState(initialDays);
  const [{ data, loading, error }, setState] = useState({ data: null, loading: true, error: null });
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [lastError, setLastError] = useState(null);
  const alive = useRef(true);
  const requestIdRef = useRef(0);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setState((s) => ({ ...s, loading: true, error: null }));
    
    const currentRequestId = ++requestIdRef.current;
    
    try {
      const res = await adminApi.stats({ days });
      if (!alive.current || currentRequestId !== requestIdRef.current) return;
      
      setState({ data: res.data, loading: false, error: null });
      setUpdatedAt(new Date());
      setLastError(null);
    } catch (err) {
      if (!alive.current || currentRequestId !== requestIdRef.current) return;
      const msg = err.message || 'خطا در دریافت آمار';
      setState((s) => (silent ? s : { data: null, loading: false, error: msg }));
      setLastError(msg);
    } finally {
      if (alive.current && currentRequestId === requestIdRef.current) setRefreshing(false);
    }
  }, [days]);

  useEffect(() => {
    alive.current = true;
    load();
    return () => { alive.current = false; };
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) load({ silent: true });
    }, REFRESH_MS);
    const onVisible = () => { if (!document.hidden) load({ silent: true }); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, [load]);

  const patchOrder = useCallback((id, status) => {
    setState((s) => (s.data ? {
      ...s,
      data: {
        ...s.data,
        recentOrders: (s.data.recentOrders || []).map((o) => (String(o._id) === String(id) ? { ...o, orderStatus: status } : o)),
        activity: (s.data.activity || []).map((a) => (a.type === 'order' && a.id === String(id) ? { ...a, status } : a)),
      },
    } : s));
  }, []);

  const advanceStatus = useCallback(async (order, nextStatus) => {
    patchOrder(order._id, nextStatus);
    try {
      await orderApi.updateStatus(order._id, nextStatus);
      load({ silent: true });
      return true;
    } catch (err) {
      patchOrder(order._id, order.orderStatus);
      throw err;
    }
  }, [patchOrder, load]);

  const adjustStock = useCallback(async (product, delta) => {
    const newStock = Math.max(0, (product.stock || 0) + delta);
    setState((s) => (s.data ? {
      ...s,
      data: {
        ...s.data,
        lowStock: (s.data.lowStock || [])
          .map((p) => (String(p._id) === String(product._id) ? { ...p, stock: newStock } : p))
          .filter((p) => p.stock <= 10),
      },
    } : s));
    try {
      await productApi.update(product._id, { stock: newStock });
      load({ silent: true });
      return true;
    } catch (err) {
      setState((s) => (s.data ? {
        ...s,
        data: {
          ...s.data,
          lowStock: [...(s.data.lowStock || []).filter((p) => String(p._id) !== String(product._id)), product]
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 8),
        },
      } : s));
      throw err;
    }
  }, [load]);

  return {
    data, loading, error, lastError, refreshing, updatedAt, days,
    setDays, reload: load, advanceStatus, adjustStock,
  };
}

export function useOrderFeed(limit = 6) {
  const [status, setStatus] = useState('');
  const [{ orders, loading, error }, setState] = useState({ orders: [], loading: true, error: null });
  const alive = useRef(true);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await adminApi.orders({ limit, ...(status ? { status } : {}) });
      if (alive.current && currentRequestId === requestIdRef.current) {
        setState({ orders: res.data?.orders || [], loading: false, error: null });
      }
    } catch (err) {
      if (alive.current && currentRequestId === requestIdRef.current) {
        setState({ orders: [], loading: false, error: err.message || 'خطا در دریافت سفارش‌ها' });
      }
    }
  }, [status, limit]);

  useEffect(() => {
    alive.current = true;
    load();
    return () => { alive.current = false; };
  }, [load]);

  const patch = useCallback((id, orderStatus) => {
    setState((s) => ({ ...s, orders: s.orders.map((o) => (String(o._id) === String(id) ? { ...o, orderStatus } : o)) }));
  }, []);

  return { orders, loading, error, status, setStatus, reload: load, patch };
}

export function fillSeries(series = [], days = 30) {
  const map = new Map(series.map((d) => [d._id, d]));
  const out = [];
  const iranOffset = 210 * 60 * 1000;
  const iranNow = new Date(Date.now() + iranOffset);
  const today = Date.UTC(iranNow.getUTCFullYear(), iranNow.getUTCMonth(), iranNow.getUTCDate());
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today - i * 86400000);
    const key = date.toISOString().slice(0, 10);
    const hit = map.get(key);
    out.push({ date: key, revenue: hit?.revenue || 0, count: hit?.count || 0 });
  }
  return out;
}
