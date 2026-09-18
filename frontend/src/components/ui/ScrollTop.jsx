import { useCallback } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import { useScrollDirection } from '../../hooks/index.js';

/**
 * دکمه‌ی بازگشت به بالا. فقط بعد از اسکرول قابل توجه و هنگام اسکرول
 * به سمت بالا ظاهر می‌شود، تا در مسیر خواندن کاربر نایستد.
 */
export default function ScrollTop() {
  const { direction, scrolled, atTop } = useScrollDirection({ threshold: 400 });

  const toTop = useCallback(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  }, []);

  const visible = scrolled && !atTop && direction === 'up';

  return (
    <button
      onClick={toTop}
      aria-label="بازگشت به بالای صفحه"
      tabIndex={visible ? 0 : -1}
      className={`scroll-top-control fixed z-40 grid size-11 place-items-center rounded-full border hairline bg-bone-50/95 text-ink-700 shadow-lift backdrop-blur transition-[opacity,transform] duration-300 ease-expo hover:bg-moss-700 hover:text-bone-50 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <FiArrowUp size={19} />
    </button>
  );
}
