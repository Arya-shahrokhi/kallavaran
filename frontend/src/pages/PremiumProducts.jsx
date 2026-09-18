import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiChevronLeft, FiStar } from 'react-icons/fi';
import ProductGrid from '../components/product/ProductGrid.jsx';
import Seo from '../components/common/Seo.jsx';
import { productApi } from '../services/endpoints.js';
import { toFa } from '../utils/format.js';

export default function PremiumProducts() {
  const [state, setState] = useState({ products: [], meta: null, loading: true, error: null });
  useEffect(() => {
    let alive = true;
    productApi.list({ premium: 'true', sort: 'popular', limit: 12 })
      .then(({ data }) => alive && setState({ products: data.products, meta: data.meta, loading: false, error: null }))
      .catch((err) => alive && setState((s) => ({ ...s, loading: false, error: err.message })));
    return () => { alive = false; };
  }, []);

  return (
    <>
      <Seo title="برنج و ادویه‌های ویژه" description="برنج ایرانی و ادویه‌های ارگانیک و پرمصرف، انتخاب‌شده برای آشپزی روزمره." />
      <section className="premium-banner relative overflow-hidden bg-moss-900 text-bone-50" data-reveal>
        <div className="premium-pattern absolute inset-0" aria-hidden="true" />
        <div className="wrap relative py-14 sm:py-20">
          <Link to="/" className="mb-7 inline-flex items-center gap-2 text-xs text-bone-200/70 hover:text-bone-50"><FiChevronLeft size={15} /> خانه</Link>
          <div className="flex max-w-2xl items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center border border-saffron-500 text-saffron-500"><FiStar size={22} /></span>
            <div>
              <p className="text-xs font-bold tracking-[.16em] text-saffron-500">قفسه منتخب کالاوران</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">برنج و ادویه‌های ویژه</h1>
              <p className="mt-4 max-w-[52ch] text-sm leading-8 text-bone-100/75 sm:text-base">برنج ایرانی و ادویه‌های ارگانیک و پرمصرف، با کیفیتی که هر روز روی سفره‌ات می‌خواهی.</p>
              <div className="mt-6 flex flex-wrap gap-2 text-2xs font-semibold text-saffron-100">
                {['دانه‌بلند و خوش‌عطر', 'انتخاب‌شده از مبدأ', 'بسته‌بندی تازه'].map((item) => <span key={item} className="rounded-full border border-saffron-500/35 bg-saffron-500/10 px-3 py-1.5">{item}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>
      <main className="wrap py-10 sm:py-14" data-reveal>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div><p className="text-2xs font-bold tracking-[.14em] text-moss-600">انتخاب‌های روزمره</p><h2 className="mt-2 text-2xl font-extrabold">برنج و ادویه‌های ضروری آشپزخانه</h2></div>
          {!state.loading && <p className="num text-sm text-ink-400">{toFa(state.meta?.total || 0)} محصول</p>}
        </div>
        {state.error ? <p className="rounded-2xl bg-berry-100 p-5 text-sm text-berry-600">{state.error}</p> : <ProductGrid products={state.products} loading={state.loading} skeletonCount={8} emptyAction={{ action: 'بازگشت به محصولات', to: '/products' }} />}
        <Link to="/products" className="group mt-10 inline-flex items-center gap-2 text-sm font-bold text-moss-700 hover:text-moss-900">مشاهده همه محصولات <FiArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /></Link>
      </main>
    </>
  );
}
