import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import CartDrawer from '../components/cart/CartDrawer.jsx';
import ScrollTop from '../components/ui/ScrollTop.jsx';
import { categoryApi } from '../services/endpoints.js';
import { useSessionState } from '../hooks/index.js';

export default function MainLayout() {
  /**
   * دسته‌بندی‌ها در sessionStorage کش می‌شوند.
   *
   * قبلاً هر بار mount شدن این layout یک درخواست تازه می‌زد و تا رسیدن
   * پاسخ، منوی دسته‌بندی‌ها و سایدبار فیلتر خالی بودند. حالا در بازدید دوم
   * فوراً از کش رندر می‌شوند و درخواست شبکه در پس‌زمینه فقط تازه‌سازی می‌کند.
   */
  const [categories, setCategories] = useSessionState('attari_categories', []);
  const { pathname } = useLocation();

  useEffect(() => {
    let alive = true;
    categoryApi.list()
      .then(({ data }) => { if (alive) setCategories(data.categories); })
      .catch(() => { /* کش موجود را نگه می‌داریم */ });
    return () => { alive = false; };
    // فقط یک‌بار در طول عمر layout
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);

  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) { nodes.forEach((n) => n.classList.add('is-visible')); return undefined; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -48px' });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div className="page-shell flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-moss-900 focus:px-4 focus:py-2 focus:text-bone-50">
        رفتن به محتوای اصلی
      </a>
      <Navbar categories={categories} />
      <main id="main" className="mobile-nav-content-offset flex-1 lg:pb-0">
        <Outlet context={{ categories }} />
      </main>
      <Footer />

      {/* سراسری: از هر صفحه‌ای قابل باز شدن است */}
      <CartDrawer />
      <ScrollTop />
    </div>
  );
}
