import { NavLink, Outlet } from 'react-router-dom';
import { FiHeart, FiLock, FiLogOut, FiMapPin, FiPackage, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/account', label: 'اطلاعات حساب', icon: FiUser, end: true },
  { to: '/account/orders', label: 'سفارش‌های من', icon: FiPackage },
  { to: '/account/wishlist', label: 'علاقه‌مندی‌ها', icon: FiHeart },
  { to: '/account/addresses', label: 'آدرس‌ها', icon: FiMapPin },
  { to: '/account/security', label: 'تغییر رمز', icon: FiLock },
];

export default function AccountLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="wrap py-9 sm:py-12">
      <div className="grid gap-9 lg:grid-cols-[15rem_1fr] lg:gap-12">
        <aside>
          <div className="flex items-center gap-3 border-b hairline pb-5">
            <span className="grid size-12 place-items-center rounded-full bg-moss-100 text-lg font-bold text-moss-900">{user?.name?.charAt(0)}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user?.name}</p>
              <p className="num truncate text-xs text-ink-400">{user?.phone}</p>
            </div>
          </div>

          <nav className="mt-4 flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => `flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-moss-700 text-bone-50' : 'text-ink-500 hover:bg-moss-50 hover:text-moss-900'
                }`}
              >
                <l.icon size={16} /> {l.label}
              </NavLink>
            ))}
            <button onClick={() => logout()} className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-berry-600 hover:bg-berry-100">
              <FiLogOut size={16} /> خروج
            </button>
          </nav>
        </aside>

        <div className="min-w-0"><Outlet /></div>
      </div>
    </div>
  );
}
