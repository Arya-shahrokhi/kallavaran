import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { FiChevronDown, FiX } from 'react-icons/fi';
import ProductGrid from '../components/product/ProductGrid.jsx';
import FilterSidebar from '../components/product/FilterSidebar.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import Seo from '../components/common/Seo.jsx';
import { productApi } from '../services/endpoints.js';
import { toFa } from '../utils/format.js';

const SORTS = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'cheapest', label: 'ارزان‌ترین' },
  { value: 'expensive', label: 'گران‌ترین' },
  { value: 'popular', label: 'محبوب‌ترین' },
  { value: 'discount', label: 'بیشترین تخفیف' },
  { value: 'rating', label: 'بهترین امتیاز' },
];

const FILTER_KEYS = ['search', 'category', 'minPrice', 'maxPrice', 'minRating', 'inStock', 'discounted', 'popular', 'featured', 'sort', 'page'];

export default function Products() {
  const { slug } = useParams();
  const { categories = [] } = useOutletContext() || {};
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => {
    const obj = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || '']));
    if (slug) obj.category = slug;
    return obj;
  }, [params, slug]);

  const [state, setState] = useState({ products: [], meta: null, loading: true, error: null });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    const query = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== null));
    productApi.list({ ...query, limit: 12 })
      .then(({ data }) => alive && setState({ products: data.products, meta: data.meta, loading: false, error: null }))
      .catch((err) => alive && setState({ products: [], meta: null, loading: false, error: err.message }));
    return () => { alive = false; };
  }, [filters]);

  const apply = useCallback((next) => {
    const clean = Object.entries(next).reduce((acc, [k, v]) => {
      if (v !== '' && v !== null && v !== undefined && !(k === 'category' && slug)) acc[k] = String(v);
      return acc;
    }, {});
    setParams(clean, { replace: false });
  }, [setParams, slug]);

  const reset = () => setParams(filters.search ? { search: filters.search } : {});

  const activeCategory = categories.find((c) => c.slug === filters.category);
  const activeCount = ['minPrice', 'maxPrice', 'minRating', 'inStock', 'discounted', 'popular']
    .filter((k) => filters[k]).length + (filters.category && !slug ? 1 : 0);

  const title = activeCategory?.name || (filters.search ? `جست‌وجوی «${filters.search}»` : 'فروشگاه کالاوران');

  return (
    <>
      <Seo title={title} description={activeCategory?.description || 'محصول مورد نظرت را با فیلترهای دقیق پیدا کن و جزئیات کاملش را ببین.'} />

      <div className="border-b hairline bg-bone-100">
        <div className="wrap py-9 sm:py-12">
          <nav className="mb-3 flex items-center gap-2 text-2xs text-ink-400" aria-label="مسیر">
            <a href="/" className="hover:text-moss-700">خانه</a>
            <span>/</span>
            <span className="text-ink-700">{title}</span>
          </nav>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          {activeCategory?.description && <p className="mt-2 max-w-[56ch] text-sm leading-7 text-ink-500">{activeCategory.description}</p>}
        </div>
      </div>

      <div className="wrap flex gap-10 py-9">
        <FilterSidebar filters={filters} categories={categories} onChange={apply} onReset={reset} activeCount={activeCount} />

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="num text-sm text-ink-500">
              {state.loading ? 'در حال بارگذاری…' : `${toFa(state.meta?.total || 0)} کالا`}
            </p>

            <div className="relative">
              <select
                value={filters.sort || 'newest'}
                onChange={(e) => apply({ ...filters, sort: e.target.value, page: 1 })}
                aria-label="مرتب‌سازی"
                className="h-10 appearance-none rounded-xl border border-bone-300 bg-bone-50 pl-9 pr-3.5 text-sm font-medium focus:border-moss-500 focus:outline-none"
              >
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <FiChevronDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={15} />
            </div>
          </div>

          {activeCount > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {['minPrice', 'maxPrice', 'minRating', 'inStock', 'discounted', 'popular'].filter((k) => filters[k]).map((k) => (
                <button
                  key={k}
                  onClick={() => apply({ ...filters, [k]: '', page: 1 })}
                  className="chip bg-moss-50 text-moss-900 hover:bg-moss-100"
                >
                  {{ minPrice: 'حداقل قیمت', maxPrice: 'حداکثر قیمت', minRating: 'امتیاز', inStock: 'موجود', discounted: 'تخفیف‌دار', popular: 'پرفروش' }[k]}
                  <FiX size={12} />
                </button>
              ))}
              <button onClick={reset} className="text-xs text-ink-400 underline hover:text-berry-600">پاک کردن همه</button>
            </div>
          )}

          {state.error ? (
            <ErrorState message={state.error} onRetry={() => apply(filters)} />
          ) : (
            <>
              <ProductGrid
                products={state.products}
                loading={state.loading}
                skeletonCount={12}
                emptyAction={activeCount ? { action: 'حذف فیلترها', onAction: reset } : { action: 'مشاهده فروشگاه کالاوران', to: '/products' }}
              />
              <Pagination
                page={state.meta?.page || 1}
                pages={state.meta?.pages || 1}
                onChange={(p) => { apply({ ...filters, page: p }); window.scrollTo({ top: 200, behavior: 'smooth' }); }}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
