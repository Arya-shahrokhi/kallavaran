import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toFa } from '../../utils/format.js';

const window5 = (page, pages) => {
  const list = [];
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  for (let i = start; i < start + 5 && i <= pages; i++) list.push(i);
  return list;
};

export default function Pagination({ page = 1, pages = 1, onChange }) {
  if (pages <= 1) return null;
  const items = window5(page, pages);

  return (
    <nav className="flex max-w-full items-center justify-center gap-1 overflow-x-auto pt-10" aria-label="صفحه‌بندی">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="grid size-9 shrink-0 place-items-center sm:size-10 rounded-lg text-ink-500 transition-colors hover:bg-moss-50 hover:text-moss-700 disabled:opacity-35 disabled:hover:bg-transparent"
        aria-label="صفحه قبل"
      >
        <FiChevronRight size={18} />
      </button>

      {items[0] > 1 && <span className="px-1 text-ink-300 sm:px-2">…</span>}

      {items.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`num size-9 shrink-0 rounded-lg sm:size-10 text-sm font-medium transition-colors duration-150 ${
            p === page ? 'bg-moss-700 text-bone-50' : 'text-ink-500 hover:bg-moss-50 hover:text-moss-700'
          }`}
        >
          {toFa(p)}
        </button>
      ))}

      {items.at(-1) < pages && <span className="px-1 text-ink-300 sm:px-2">…</span>}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pages}
        className="grid size-9 shrink-0 place-items-center sm:size-10 rounded-lg text-ink-500 transition-colors hover:bg-moss-50 hover:text-moss-700 disabled:opacity-35 disabled:hover:bg-transparent"
        aria-label="صفحه بعد"
      >
        <FiChevronLeft size={18} />
      </button>
    </nav>
  );
}
