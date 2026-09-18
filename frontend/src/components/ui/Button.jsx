import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import Spinner from './Spinner.jsx';

const VARIANTS = {
  primary: 'btn-primary', accent: 'btn-accent', ghost: 'btn-ghost', outline: 'btn-outline', danger: 'btn-danger',
};
const SIZES = { sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' };

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, icon: Icon, to, href, children, className = '', ...rest }, ref,
) {
  const cls = `${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  const inner = (
    <>
      {loading ? <Spinner size={16} /> : Icon ? <Icon size={size === 'lg' ? 20 : 18} /> : null}
      {children}
    </>
  );
  if (to) return <Link ref={ref} to={to} className={cls} {...rest}>{inner}</Link>;
  if (href) return <a ref={ref} href={href} className={cls} {...rest}>{inner}</a>;
  return (
    <button ref={ref} className={cls} disabled={loading || rest.disabled} {...rest}>
      {inner}
    </button>
  );
});

export default Button;
