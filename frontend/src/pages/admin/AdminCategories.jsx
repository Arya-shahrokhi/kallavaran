import { useEffect, useState } from 'react';
import { FiEdit2, FiLayers, FiPlus, FiTrash2 } from 'react-icons/fi';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { RowsSkeleton } from '../../components/ui/Skeleton.jsx';
import Seo from '../../components/common/Seo.jsx';
import { categoryApi } from '../../services/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useSubmit } from '../../hooks/index.js';
import { toFa } from '../../utils/format.js';
import SmartImage from '../../components/ui/SmartImage.jsx';

const EMPTY = { name: '', description: '', image: '', order: 0, isActive: true };

export default function AdminCategories() {
  const toast = useToast();
  const [categories, setCategories] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => categoryApi.list({ all: 'true' }).then(({ data }) => setCategories(data.categories)).catch(() => setCategories([]));
  useEffect(load, []);

  const open = (c) => {
    setEditing(c || 'new');
    setForm(c ? { ...c, image: c.image?.url || '' } : EMPTY);
    setErrors({});
  };

  const [save, saving] = useSubmit(async (e) => {
    e?.preventDefault?.();
    if (form.name.trim().length < 2) { setErrors({ name: 'نام دسته‌بندی الزامی است' }); return; }
    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      order: Number(form.order) || 0,
      isActive: Boolean(form.isActive),
      ...(form.image ? { image: { url: form.image } } : {}),
    };
    try {
      const res = editing === 'new' ? await categoryApi.create(payload) : await categoryApi.update(editing._id, payload);
      toast.success(res.message);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
      setErrors(err.details || {});
    }
  });

  const remove = async () => {
    setBusy(true);
    try {
      await categoryApi.remove(target._id);
      toast.success('دسته‌بندی حذف شد');
      setTarget(null);
      load();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <>
      <Seo title="مدیریت دسته‌بندی‌ها" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">دسته‌بندی‌ها</h1>
        <Button icon={FiPlus} size="md" onClick={() => open(null)}>دسته‌بندی جدید</Button>
      </div>

      {categories === null ? (
        <div className="mt-6 rounded-2xl border hairline bg-bone-50 p-5"><RowsSkeleton rows={5} /></div>
      ) : categories.length === 0 ? (
        <div className="mt-6 rounded-2xl border hairline bg-bone-50">
          <EmptyState icon={FiLayers} title="دسته‌بندی‌ای وجود ندارد" description="قفسه‌های فروشگاه را بسازید تا محصولات جای درست خود بنشینند." action="دسته‌بندی جدید" onAction={() => open(null)} />
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((c) => (
            <li key={c._id} className="flex gap-4 rounded-2xl border hairline bg-bone-50 p-4">
              {c.image?.url ? (
                <SmartImage src={c.image.url} alt="" loading="lazy" className="size-16 shrink-0 rounded-xl object-cover" fallbackLabel="" />
              ) : (
                <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-moss-50 text-moss-600"><FiLayers size={20} /></span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{c.name}</p>
                    <p className="num mt-1 text-2xs text-ink-400">{toFa(c.productsCount ?? 0)} محصول · ترتیب {toFa(c.order)}</p>
                  </div>
                  {!c.isActive && <Badge tone="neutral">غیرفعال</Badge>}
                </div>
                <div className="mt-3 flex gap-1">
                  <button onClick={() => open(c)} aria-label="ویرایش" className="rounded-lg p-1.5 text-ink-400 hover:bg-moss-50 hover:text-moss-700"><FiEdit2 size={15} /></button>
                  <button onClick={() => setTarget(c)} aria-label="حذف" className="rounded-lg p-1.5 text-ink-400 hover:bg-berry-100 hover:text-berry-600"><FiTrash2 size={15} /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(editing)} onClose={() => setEditing(null)}
        title={editing === 'new' ? 'دسته‌بندی جدید' : 'ویرایش دسته‌بندی'}
        footer={(
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>انصراف</Button>
            <Button size="sm" loading={saving} onClick={save}>ذخیره</Button>
          </>
        )}
      >
        <form onSubmit={save} className="space-y-4" noValidate>
          <Input label="نام" value={form.name} error={errors.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <div>
            <label className="label" htmlFor="cdesc">توضیح</label>
            <textarea id="cdesc" rows={3} value={form.description || ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="field h-auto resize-none py-3 leading-7" />
          </div>
          <Input label="آدرس تصویر" placeholder="https://…" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />
          <Input label="ترتیب نمایش" inputMode="numeric" className="num" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} />
          <label className="flex items-center gap-2.5 text-sm">
            <input type="checkbox" checked={Boolean(form.isActive)} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="size-4 accent-moss-700" />
            فعال
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(target)} onClose={() => setTarget(null)} onConfirm={remove} loading={busy}
        title="حذف دسته‌بندی"
        description={`«${target?.name}» حذف می‌شود. اگر محصولی داخل آن باشد، حذف انجام نمی‌شود.`}
        confirmText="حذف کن"
      />
    </>
  );
}
