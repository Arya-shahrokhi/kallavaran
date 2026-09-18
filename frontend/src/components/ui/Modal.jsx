import { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

/** dialog بومی: تله فوکوس و بستن با Escape بدون کد اضافه. */
export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose?.(); }}
      className={`w-[calc(100%-2rem)] ${widths[size]} rounded-2xl bg-bone-50 p-0 text-ink-900 shadow-pop backdrop:bg-ink-900/45 backdrop:backdrop-blur-[2px] open:animate-fade-up`}
    >
      <div className="flex items-start justify-between gap-3 border-b hairline px-4 py-4 sm:gap-6 sm:px-6 sm:py-5">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
        </div>
        <button onClick={onClose} aria-label="بستن" className="-mr-1 rounded-lg p-2 text-ink-400 transition-colors hover:bg-bone-200 hover:text-ink-900">
          <FiX size={18} />
        </button>
      </div>
      <div className="max-h-[65dvh] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">{children}</div>
      {footer && <div className="flex flex-wrap justify-end gap-3 border-t hairline bg-bone-100 px-4 py-4 sm:px-6">{footer}</div>}
    </dialog>
  );
}
