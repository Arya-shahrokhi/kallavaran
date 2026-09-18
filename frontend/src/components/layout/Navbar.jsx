import { memo, useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  FiChevronDown, FiGrid, FiHeart, FiHome, FiLogOut, FiMenu, FiSearch, FiShoppingBag, FiStar, FiUser, FiX,
} from 'react-icons/fi';
import Logo from './Logo.jsx';
import SearchBar from '../product/SearchBar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCartActions, useCartData } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useDismiss, useHotkey, useLockBody, useScrollDirection } from '../../hooks/index.js';
import { toFa } from '../../utils/format.js';

const MAIN_LINKS = [
  { to: '/products', label: 'همه محصولات' },
  { to: '/premium-products', label: 'محصولات ممتاز' },
  { to: '/products?discounted=true', label: 'تخفیف‌دارها' },
  { to: '/journal', label: 'مجله گیاهان' },
  { to: '/about', label: 'درباره ما' },
];

/**
 * نشان‌گر تعداد سبد. جدا و memo شده تا وقتی عدد عوض می‌شود،
 * فقط همین حباب رندر شود نه کل هدر.
 */
const CartBadge = memo(function CartBadge({ count }) {
  const [bump, setBump] = useState(false);

  // با تغییر تعداد یک تپش کوچک می‌زند: بازخورد دیداری افزودن به سبد
  useEffect(() => {
    if (!count) return undefined;
    setBump(true);
    const id = setTimeout(() => setBump(false), 320);
    return () => clearTimeout(id);
  }, [count]);

  if (!count) return null;
  return (
    <span
      className={`num absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-saffron-500 px-1 text-2xs font-bold text-ink-900 transition-transform duration-300 ease-expo ${bump ? 'scale-125' : 'scale-100'}`}
      aria-hidden="true"
    >
      {toFa(count)}
    </span>
  );
});

/** منوی کشویی دسته‌بندی‌ها روی دسکتاپ. */
function CategoryMenu({ categories }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss(open, close);
  const { pathname } = useLocation();

  useEffect(close, [pathname, close]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`btn btn-sm gap-1.5 rounded-xl px-3 text-sm font-medium transition-colors ${open ? 'bg-moss-50 text-moss-900' : 'text-ink-700 hover:bg-moss-50'}`}
      >
        <FiGrid size={16} />
        دسته‌بندی‌ها
        <FiChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[34rem] overflow-hidden rounded-2xl border hairline bg-bone-50 p-2 shadow-pop animate-fade-in">
          {categories.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-ink-400">دسته‌بندی‌ها در حال بارگذاری است…</p>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-0.5">
                {categories.slice(0, 10).map((c) => (
                  <li key={c._id}>
                    <Link
                      to={`/category/${c.slug}`}
                      className="flex min-w-0 items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm text-ink-700 transition-colors hover:bg-moss-50 hover:text-moss-900"
                    >
                      <span className="truncate">{c.name}</span>
                      <span className="num shrink-0 text-2xs text-ink-300">{toFa(c.productsCount ?? 0)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to="/products" className="mt-1 block rounded-xl bg-bone-100 px-3 py-2.5 text-center text-xs font-semibold text-moss-700 hover:bg-moss-50">
                مشاهده همه محصولات
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** منوی حساب کاربری. */
function AccountMenu() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss(open, close);

  if (!user) {
    return (
      <Link to="/login" className="btn btn-outline btn-sm gap-1.5 text-xs max-sm:hidden">
        <FiUser size={15} /> ورود
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="منوی حساب کاربری"
        className="grid size-10 place-items-center rounded-full bg-moss-100 text-sm font-bold text-moss-900 transition-colors hover:bg-moss-300"
      >
        {user.name?.charAt(0) || <FiUser size={17} />}
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+0.6rem)] z-50 w-56 overflow-hidden rounded-2xl border hairline bg-bone-50 p-1.5 shadow-pop animate-fade-in">
          <div className="border-b hairline px-3 pb-2.5 pt-2">
            <p className="truncate text-sm font-bold">{user.name}</p>
            <p className="num truncate text-2xs text-ink-400">{user.phone}</p>
          </div>
          <nav className="py-1">
            {[
              ['/account', 'اطلاعات حساب'],
              ['/account/orders', 'سفارش‌های من'],
              ['/account/wishlist', 'علاقه‌مندی‌ها'],
              ['/account/addresses', 'آدرس‌ها'],
              ...(isAdmin ? [['/admin', 'پنل مدیریت']] : []),
            ].map(([to, label]) => (
              <Link key={to} to={to} onClick={close} className="block rounded-xl px-3 py-2 text-sm text-ink-700 transition-colors hover:bg-moss-50 hover:text-moss-900">
                {label}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => { close(); logout(); }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-berry-600 transition-colors hover:bg-berry-100"
          >
            <FiLogOut size={15} /> خروج از حساب
          </button>
        </div>
      )}
    </div>
  );
}


function MobileBottomNav({ cart, liked, openDrawer }) {
  const { pathname } = useLocation();
  const items = [
    { to: '/', label: 'خانه', icon: FiHome, exact: true },
    { to: '/products', label: 'محصولات', icon: FiGrid },
    { to: '/premium-products', label: 'ممتاز', icon: FiStar },
    { to: '/account/wishlist', label: 'علاقه‌مندی', icon: FiHeart, badge: liked.length },
    { to: '/account', label: 'حساب', icon: FiUser },
  ];
  const active = (item) => item.exact ? pathname === item.to : item.to === '/account' ? pathname === '/account' : pathname.startsWith(item.to);
  return (
    <nav className="mobile-bottom-nav z-[55] grid grid-cols-6 rounded-2xl border border-bone-300/80 bg-bone-50/95 p-1.5 shadow-pop backdrop-blur-md lg:hidden" aria-label="ناوبری موبایل">
      {items.map(({ to, label, icon: Icon, exact, badge }) => (
        <NavLink key={to} to={to} end={exact} className={`mobile-nav-item ${active({ to, exact }) ? 'is-active' : ''}`} aria-label={label}>
          <span className="relative"><Icon size={16} strokeWidth={active({ to, exact }) ? 2.35 : 1.75} />{badge > 0 && <span className="num mobile-nav-badge">{toFa(badge)}</span>}</span>
          <span className="mobile-nav-label">{label}</span>
        </NavLink>
      ))}
      <button type="button" className="mobile-nav-cart" onClick={openDrawer} aria-label={`سبد خرید، ${cart.itemsCount} کالا`}>
        <span className="relative"><FiShoppingBag size={16} strokeWidth={1.75} />{cart.itemsCount > 0 && <span className="num mobile-nav-badge">{toFa(cart.itemsCount)}</span>}</span>
        <span className="mobile-nav-label">سبد</span>
      </button>
    </nav>
  );
}

export default function Navbar({ categories = [] }) {
  const { direction, scrolled } = useScrollDirection();
  const { cart } = useCartData();
  const { openDrawer } = useCartActions();
  const { products: liked } = useWishlist();
  const { pathname } = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useLockBody(menuOpen || searchOpen);
  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname]);

  // Ctrl/Cmd+K جست‌وجو را باز می‌کند، مثل ابزارهای حرفه‌ای
  useHotkey('mod+k', useCallback(() => setSearchOpen(true), []));

  // هدر با اسکرول پایین جمع می‌شود و با اسکرول بالا برمی‌گردد:
  // در موبایل فضای عمودی بیشتری به محتوا می‌دهد
  const hidden = direction === 'down' && !menuOpen && !searchOpen;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-[transform,box-shadow,background-color] duration-300 ease-expo ${
          hidden ? '-translate-y-full' : 'translate-y-0'
        } ${scrolled ? 'bg-bone-50/90 shadow-card backdrop-blur-md' : 'bg-bone-50'}`}
        style={{ height: 'var(--header-h)' }}
      >
        <div className="wrap flex h-full items-center gap-3">
          <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="کالاوران، صفحه اصلی">
            <Logo className="size-9 text-berry-600 transition-transform duration-300 ease-expo group-hover:scale-105" />
            <span className="text-lg font-extrabold tracking-tight text-ink-900 max-[420px]:hidden">کالاوران</span>
          </Link>

          <nav className="mr-3 hidden items-center gap-1 lg:flex">
            <CategoryMenu categories={categories} />
            {MAIN_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-moss-900' : 'text-ink-700 hover:bg-moss-50 hover:text-moss-900'
                }`}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* جست‌وجوی همیشه‌حاضر روی دسکتاپ */}
          <div className="mr-auto hidden max-w-md flex-1 md:block">
            <SearchBar />
          </div>

          <div className="mr-auto flex items-center gap-1.5 md:mr-0">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="جست‌وجو"
              className="grid size-10 place-items-center rounded-xl text-ink-700 transition-colors hover:bg-moss-50 md:hidden"
            >
              <FiSearch size={20} />
            </button>

            <Link
              to="/account/wishlist"
              aria-label="علاقه‌مندی‌ها"
              className="relative grid size-10 place-items-center rounded-xl text-ink-700 transition-colors hover:bg-moss-50 max-sm:hidden"
            >
              <FiHeart size={19} />
              {liked.length > 0 && (
                <span className="num absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-berry-600 px-1 text-[0.6rem] font-bold text-bone-50">
                  {toFa(liked.length)}
                </span>
              )}
            </Link>

            <button
              onClick={openDrawer}
              aria-label={`سبد خرید، ${cart.itemsCount} کالا`}
              className="relative grid size-10 place-items-center rounded-xl text-ink-700 transition-colors hover:bg-moss-50"
            >
              <FiShoppingBag size={20} />
              <CartBadge count={cart.itemsCount} />
            </button>

            <AccountMenu />

            <button
              onClick={() => setMenuOpen(true)}
              aria-label="منوی اصلی"
              className="grid size-10 place-items-center rounded-xl text-ink-700 transition-colors hover:bg-moss-50 lg:hidden"
            >
              <FiMenu size={21} />
            </button>
          </div>
        </div>
      </header>

      <MobileBottomNav cart={cart} liked={liked} openDrawer={openDrawer} />

      {/* روپوش جست‌وجو */}
      {searchOpen && (
        <div className="fixed inset-0 z-[80] animate-fade-in">
          <button className="absolute inset-0 bg-ink-900/45 backdrop-blur-[2px]" onClick={() => setSearchOpen(false)} aria-label="بستن جست‌وجو" />
          <div className="mobile-search-panel absolute inset-x-0 top-0 bg-bone-50 px-4 pb-4 shadow-pop sm:px-6 sm:pb-6">
            <div className="wrap flex items-center gap-3">
              <div className="flex-1"><SearchBar autoFocus onNavigate={() => setSearchOpen(false)} /></div>
              <button onClick={() => setSearchOpen(false)} aria-label="بستن" className="grid size-10 shrink-0 place-items-center rounded-xl text-ink-500 hover:bg-bone-200">
                <FiX size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* کشوی موبایل */}
      {menuOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button className="absolute inset-0 bg-ink-900/50 animate-fade-in" onClick={() => setMenuOpen(false)} aria-label="بستن منو" />
          <div className="mobile-menu-drawer absolute inset-y-0 right-0 flex w-80 max-w-[86vw] flex-col bg-bone-50 animate-slide-in">
            <div className="mobile-menu-header flex items-center justify-between border-b hairline px-4 pb-4">
              <span className="flex items-center gap-2.5">
                <Logo className="size-8 text-berry-600" />
                <span className="font-extrabold">کالاوران</span>
              </span>
              <button onClick={() => setMenuOpen(false)} aria-label="بستن" className="rounded-xl p-2 text-ink-400 hover:bg-bone-200">
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-1">
                {MAIN_LINKS.map((l) => (
                  <Link key={l.to} to={l.to} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-moss-50 hover:text-moss-900">
                    {l.label}
                  </Link>
                ))}
              </nav>

              <p className="mb-2 mt-6 px-3 text-2xs font-bold uppercase tracking-[0.14em] text-moss-600">دسته‌بندی‌ها</p>
              <nav className="space-y-1">
                {categories.map((c) => (
                  <Link key={c._id} to={`/category/${c.slug}`} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-ink-700 hover:bg-moss-50">
                    <span className="truncate">{c.name}</span>
                    <span className="num text-2xs text-ink-300">{toFa(c.productsCount ?? 0)}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mobile-menu-footer border-t hairline px-4 pt-4">
              <Link to="/account" className="btn btn-outline btn-md w-full gap-2">
                <FiUser size={17} /> حساب کاربری من
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
