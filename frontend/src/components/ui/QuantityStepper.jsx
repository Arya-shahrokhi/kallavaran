import { FiMinus, FiPlus } from 'react-icons/fi';
import { toFa } from '../../utils/format.js';

export default function QuantityStepper({ value, onChange, min = 1, max = 50, disabled, size = 'md' }) {
  const h = size === 'sm' ? 'h-9' : 'h-11';
  const btn = 'grid aspect-square place-items-center text-ink-500 transition-colors hover:text-moss-700 disabled:opacity-30';
  return (
    <div className={`inline-flex ${h} items-stretch overflow-hidden rounded-xl border border-bone-300 bg-bone-50`}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={disabled || value <= min} aria-label="کاهش تعداد">
        <FiMinus size={15} />
      </button>
      <span className="num grid min-w-10 place-items-center border-x hairline px-1 text-sm font-semibold" aria-live="polite">
        {toFa(value)}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={disabled || value >= max} aria-label="افزایش تعداد">
        <FiPlus size={15} />
      </button>
    </div>
  );
}
