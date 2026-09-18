import { forwardRef, useId, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = forwardRef(function Input(
  { label, error, hint, type = 'text', icon: Icon, className = '', ...rest }, ref,
) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={className}>
      {label && <label htmlFor={id} className="label">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-300" size={18} />}
        <input
          ref={ref}
          id={id}
          type={isPassword && reveal ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`field ${Icon ? 'pr-11' : ''} ${isPassword ? 'pl-11' : ''} ${error ? 'field-error' : ''}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? 'پنهان کردن رمز' : 'نمایش رمز'}
            className="absolute left-0.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-bone-100 hover:text-ink-700"
          >
            {reveal ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-berry-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;
