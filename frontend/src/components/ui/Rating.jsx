import { FiStar } from 'react-icons/fi';
import { toFa } from '../../utils/format.js';

export default function Rating({ value = 0, count, size = 14, showValue = true, interactive = false, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1.5" role={interactive ? 'radiogroup' : undefined} aria-label="امتیاز">
      <div className={`flex items-center ${interactive ? 'gap-0' : 'gap-0.5'}`}>
        {stars.map((s) => {
          const filled = value >= s - 0.5;
          const star = (
            <FiStar
              size={size}
              className={filled ? 'fill-saffron-500 text-saffron-500' : 'text-bone-300'}
              strokeWidth={filled ? 1 : 1.6}
            />
          );
          return interactive ? (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={value === s}
              aria-label={`${toFa(s)} ستاره`}
              onClick={() => onChange?.(s)}
              className="grid size-11 shrink-0 place-items-center rounded-lg transition-[background-color,transform] duration-150 ease-quart hover:bg-saffron-50 active:scale-95"
            >
              {star}
            </button>
          ) : <span key={s}>{star}</span>;
        })}
      </div>
      {showValue && (
        <span className="num text-xs text-ink-400">
          {toFa(Number(value || 0).toFixed(1))}
          {count !== undefined && <span className="text-ink-300"> ({toFa(count)})</span>}
        </span>
      )}
    </div>
  );
}
