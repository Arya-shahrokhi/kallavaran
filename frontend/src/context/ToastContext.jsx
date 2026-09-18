import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { FiAlertTriangle, FiCheck, FiInfo, FiX } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

const TONES = {
  success: { icon: FiCheck, cls: 'bg-moss-900 text-bone-50' },
  error: { icon: FiAlertTriangle, cls: 'bg-berry-600 text-bone-50' },
  info: { icon: FiInfo, cls: 'bg-ink-900 text-bone-50' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const { pathname } = useLocation();
  const hasStorefrontNav = !pathname.startsWith('/admin');

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback((message, type = 'info', ttl = 3800) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((list) => [...list.slice(-2), { id, message, type }]);
    setTimeout(() => dismiss(id), ttl);
  }, [dismiss]);

  const value = useMemo(() => ({
    toast: push,
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
  }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={`toast-stack fixed z-[70] flex flex-col items-center gap-2 sm:items-start ${hasStorefrontNav ? 'toast-stack--with-nav' : ''}`} role="status" aria-live="polite">
        {toasts.map((t) => {
          const { icon: Icon, cls } = TONES[t.type] || TONES.info;
          return (
            <div key={t.id} className={`animate-fade-up flex w-full max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-pop ${cls}`}>
              <Icon className="shrink-0" size={18} />
              <span className="flex-1 leading-6">{t.message}</span>
              <button onClick={() => dismiss(t.id)} aria-label="بستن" className="grid size-10 shrink-0 place-items-center rounded-lg opacity-70 transition-opacity hover:opacity-100">
                <FiX size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
