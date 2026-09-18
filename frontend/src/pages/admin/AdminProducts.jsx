import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { RowsSkeleton } from '../../components/ui/Skeleton.jsx';
import Seo from '../../components/common/Seo.jsx';
import { adminApi, productApi } from '../../services/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useDebounced } from '../../hooks/index.js';
import { finalPrice, toFa, toman } from '../../utils/format.js';
import SmartImage from '../../components/ui/SmartImage.jsx';

export default function AdminProducts() {
  const toast = useToast();
  const [state, setState] = useState({ products: null, meta: null });
  const [page, setPage] = useState(1);
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const stock = params.get('stock') || undefined;
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const term = useDebounced(search, 400);

  const load = () => {
    setState((s) => ({ ...s, products: null }));
    adminApi.products({ page, limit: 15, search: term || undefined, stock })
      .then(({ data }) => setState({ products: data.products, meta: data.meta }))
      .catch(() => setState({ products: [], meta: null }));
  };

  useEffect(load, [page, term, stock]);

  const remove = async () => {
    setBusy(true);
    try {
      await productApi.remove(target._id);
      toast.success('محصول حذف شد');
      setTarget(null);
      load();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const toggleActive = async (p) => {
    try {
      await productApi.update(p._id, { isActive: !p.isActive });
      toast.success(p.isActive ? 'محصول غیرفعال شد' : 'محصول فعال شد');
      load();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <>
      <Seo title="مدیریت محصولات" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">محصولات</h1>
          {state.meta && <p className="num mt-1.5 text-sm text-ink-500">{toFa(state.meta.total)} کالا</p>}
        </div>
        <Button to="/admin/products/new" icon={FiPlus} size="md">محصول جدید</Button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <FiSearch className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
        <input
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="جست‌وجوی نام محصول" aria-label="جست‌وجو"
          className="field bg-bone-50 pr-11"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border hairline bg-bone-50">
        {state.products === null ? (
          <div className="p-5"><RowsSkeleton rows={8} /></div>
        ) : state.products.length === 0 ? (
          <EmptyState title="محصولی پیدا نشد" description="عبارت جست‌وجو را تغییر دهید یا محصول جدیدی بسازید." action="محصول جدید" to="/admin/products/new" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead className="bg-bone-100 text-2xs uppercase tracking-wide text-ink-400">
                <tr>
                  {['محصول', 'دسته‌بندی', 'قیمت', 'موجودی', 'وضعیت', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-right font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y hairline">
                {state.products.map((p) => (
                  <tr key={p._id} className="transition-colors hover:bg-moss-50/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <SmartImage src={p.images?.[0]?.url} alt="" loading="lazy" className="size-11 shrink-0 rounded-lg object-cover" fallbackLabel="" />
                        <Link to={`/admin/products/${p._id}/edit`} className="line-clamp-1 max-w-[16rem] font-medium hover:text-moss-700">{p.name}</Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-500">{p.category?.name}</td>
                    <td className="num px-4 py-3">
                      {toman(finalPrice(p), { suffix: false })}
                      {p.discount > 0 && <span className="mr-1.5 text-2xs text-berry-600">٪{toFa(p.discount)}</span>}
                    </td>
                    <td className="num px-4 py-3">
                      <span className={p.stock === 0 ? 'text-berry-600' : p.stock <= 10 ? 'text-saffron-600' : ''}>{toFa(p.stock)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(p)} aria-label="تغییر وضعیت">
                        <Badge tone={p.isActive ? 'moss' : 'neutral'}>{p.isActive ? 'فعال' : 'غیرفعال'}</Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link to={`/admin/products/${p._id}/edit`} aria-label="ویرایش" className="rounded-lg p-2 text-ink-400 hover:bg-moss-50 hover:text-moss-700"><FiEdit2 size={15} /></Link>
                        <button onClick={() => setTarget(p)} aria-label="حذف" className="rounded-lg p-2 text-ink-400 hover:bg-berry-100 hover:text-berry-600"><FiTrash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={state.meta?.page || 1} pages={state.meta?.pages || 1} onChange={setPage} />

      <ConfirmDialog
        open={Boolean(target)} onClose={() => setTarget(null)} onConfirm={remove} loading={busy}
        title="حذف محصول"
        description={`«${target?.name}» و همه نظرات آن حذف می‌شود. اگر فقط می‌خواهید از فروشگاه پنهان شود، آن را غیرفعال کنید.`}
        confirmText="حذف کن"
      />
    </>
  );
}
