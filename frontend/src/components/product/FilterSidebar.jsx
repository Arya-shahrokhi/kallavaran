import { useEffect, useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import Rating from '../ui/Rating.jsx';
import Button from '../ui/Button.jsx';
import { toFa, toman } from '../../utils/format.js';
import { useLockBody } from '../../hooks/index.js';

const PRICE_STEPS = [
  { label: 'تا ۱۰۰ هزار', min: 0, max: 100000 },
  { label: '۱۰۰ تا ۳۰۰ هزار', min: 100000, max: 300000 },
  { label: '۳۰۰ تا ۷۰۰ هزار', min: 300000, max: 700000 },
  { label: 'بیش از ۷۰۰ هزار', min: 700000, max: undefined },
];

function Group({ title, children }) {
  return (
    <section className="border-b hairline py-5 first:pt-0 last:border-0">
      <h3 className="mb-3.5 text-sm font-semibold text-ink-900">{title}</h3>
      {children}
    </section>
  );
}

function Check({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm text-ink-500 transition-colors hover:text-ink-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 shrink-0 rounded border-bone-300 text-moss-700 accent-moss-700"
      />
      <span className="flex-1">{children}</span>
    </label>
  );
}

export function FilterPanel({ filters, categories, onChange, onReset }) {
  const set = (patch) => onChange({ ...filters, ...patch, page: 1 });

  return (
    <div>
      <Group title="دسته‌بندی">
        <div className="-mt-1.5 max-h-64 overflow-y-auto pl-1">
          <Check checked={!filters.category} onChange={() => set({ category: '' })}>همه محصولات</Check>
          {categories.map((c) => (
            <Check key={c._id} checked={filters.category === c.slug} onChange={() => set({ category: c.slug })}>
              {c.name}
              <span className="num mr-1 text-2xs text-ink-300">{toFa(c.productsCount ?? 0)}</span>
            </Check>
          ))}
        </div>
      </Group>

      <Group title="محدوده قیمت">
        <div className="-mt-1.5">
          {PRICE_STEPS.map((step) => {
            const active = Number(filters.minPrice || 0) === step.min && String(filters.maxPrice || '') === String(step.max ?? '');
            return (
              <Check key={step.label} checked={active} onChange={(on) => set({ minPrice: on ? step.min : '', maxPrice: on ? (step.max ?? '') : '' })}>
                {step.label}
              </Check>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number" inputMode="numeric" placeholder="از" value={filters.minPrice || ''}
            onChange={(e) => set({ minPrice: e.target.value })}
            className="field num h-9 px-2.5 text-xs"
          />
          <span className="text-ink-300">—</span>
          <input
            type="number" inputMode="numeric" placeholder="تا" value={filters.maxPrice || ''}
            onChange={(e) => set({ maxPrice: e.target.value })}
            className="field num h-9 px-2.5 text-xs"
          />
        </div>
        {filters.maxPrice && <p className="num mt-2 text-2xs text-ink-400">سقف: {toman(filters.maxPrice)}</p>}
      </Group>

      <Group title="امتیاز">
        <div className="-mt-1.5">
          {[4, 3, 2].map((r) => (
            <Check key={r} checked={Number(filters.minRating) === r} onChange={(on) => set({ minRating: on ? r : '' })}>
              <span className="flex items-center gap-2">
                <Rating value={r} showValue={false} size={13} />
                <span className="text-xs">و بالاتر</span>
              </span>
            </Check>
          ))}
        </div>
      </Group>

      <Group title="سایر">
        <div className="-mt-1.5">
          <Check checked={Boolean(filters.inStock)} onChange={(on) => set({ inStock: on ? 'true' : '' })}>فقط کالای موجود</Check>
          <Check checked={Boolean(filters.discounted)} onChange={(on) => set({ discounted: on ? 'true' : '' })}>فقط تخفیف‌دار</Check>
          <Check checked={Boolean(filters.popular)} onChange={(on) => set({ popular: on ? 'true' : '' })}>پرفروش‌ها</Check>
        </div>
      </Group>

      <Button variant="ghost" size="sm" className="mt-5 w-full" onClick={onReset}>حذف همه فیلترها</Button>
    </div>
  );
}

export default function FilterSidebar({ filters, categories, onChange, onReset, activeCount }) {
  const [open, setOpen] = useState(false);
  useLockBody(open);
  useEffect(() => { setOpen(false); }, [filters.category]);

  return (
    <>
      {/* دسکتاپ: ستون چسبان */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-[calc(var(--header-h)+1.5rem)]">
          <FilterPanel filters={filters} categories={categories} onChange={onChange} onReset={onReset} />
        </div>
      </aside>

      {/* موبایل: دکمه شناور + کشو */}
      <button
        onClick={() => setOpen(true)}
        className="mobile-filter-trigger btn-primary btn-md fixed left-1/2 z-40 -translate-x-1/2 shadow-pop lg:hidden"
      >
        <FiFilter size={17} />
        فیلترها
        {activeCount > 0 && <span className="num grid size-5 place-items-center rounded-full bg-saffron-500 text-2xs font-bold text-ink-900">{toFa(activeCount)}</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button className="absolute inset-0 bg-ink-900/45 animate-fade-in" onClick={() => setOpen(false)} aria-label="بستن فیلترها" />
          <div className="mobile-filter-sheet absolute inset-x-0 bottom-0 overflow-y-auto rounded-t-3xl bg-bone-50 p-5 animate-fade-up">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">فیلتر محصولات</h2>
              <button onClick={() => setOpen(false)} aria-label="بستن" className="rounded-lg p-2 text-ink-400 hover:bg-bone-200"><FiX size={18} /></button>
            </div>
            <FilterPanel filters={filters} categories={categories} onChange={onChange} onReset={onReset} />
            <div className="mobile-filter-sheet-actions sticky -mx-5 -mb-5 mt-5 border-t hairline bg-bone-50 px-4 pt-4">
              <Button className="w-full" size="md" onClick={() => setOpen(false)}>نمایش نتایج</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
