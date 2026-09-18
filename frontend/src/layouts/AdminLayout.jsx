import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  FiArrowRight, FiBarChart2, FiGrid, FiLayers, FiMenu, FiPackage, FiStar, FiUsers, FiX,
} from 'react-icons/fi';
import Logo from '../components/layout/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLockBody } from '../hooks/index.js';

const LINKS = [
  { to: '/admin', label: 'داشبورد', icon: FiBarChart2, end: true },
  { to: '/admin/products', label: 'محصولات', icon: FiPackage },
  { to: '/admin/categories', label: 'دسته‌بندی‌ها', icon: FiLayers },
  { to: '/admin/orders', label: 'سفارش‌ها', icon: FiGrid },
  { to: '/admin/users', label: 'کاربران', icon: FiUsers },
  { to: '/admin/reviews', label: 'نظرات', icon: FiStar },
];

export default function AdminLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  useLockBody(open);

  const nav = (
    <nav className="space-y-1">
      {LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
            isActive ? 'bg-moss-700 text-bone-50' : 'text-bone-200/70 hover:bg-bone-50/8 hover:text-bone-50'
          }`}
        >
          <l.icon size={17} /> {l.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-dvh bg-bone-100">
      {/* سایدبار تیره فقط در پنل مدیریت: تمایز واضح از فروشگاه */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-ink-900 p-4 lg:flex">
        <Link to="/" className="mb-7 flex items-center gap-2.5 px-1.5 pt-2">
          <Logo className="size-8 text-moss-300" />
          <span className="text-sm font-bold text-bone-50">پنل مدیریت</span>
        </Link>
        {nav}
        <div className="mt-auto space-y-3 border-t border-bone-50/10 pt-4">
          <div className="flex items-center gap-2.5 px-1.5">
            <span className="grid size-9 place-items-center rounded-full bg-moss-600 text-sm font-bold text-bone-50">{user?.name?.charAt(0)}</span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold text-bone-50">{user?.name}</span>
              <span className="block text-2xs text-bone-200/50">مدیر</span>
            </span>
          </div>
          <Link to="/" className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs text-bone-200/60 hover:bg-bone-50/8 hover:text-bone-50">
            <FiArrowRight size={15} /> بازگشت به فروشگاه
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b hairline bg-bone-50/95 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="منوی مدیریت" className="grid size-10 place-items-center rounded-xl hover:bg-bone-100"><FiMenu size={21} /></button>
          <span className="font-bold">پنل مدیریت</span>
          <Link to="/" className="mr-auto text-xs text-moss-700">فروشگاه</Link>
        </header>

        {open && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button className="absolute inset-0 bg-ink-900/60 animate-fade-in" onClick={() => setOpen(false)} aria-label="بستن" />
            <div className="absolute inset-y-0 right-0 w-72 bg-ink-900 p-4 animate-slide-in">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm font-bold text-bone-50">پنل مدیریت</span>
                <button onClick={() => setOpen(false)} aria-label="بستن" className="rounded-lg p-2 text-bone-200/60"><FiX size={20} /></button>
              </div>
              {nav}
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </div>
    </div>
  );
}
