import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiArrowRight, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Seo from '../../components/common/Seo.jsx';
import { SkeletonBlock } from '../../components/ui/Skeleton.jsx';
import { categoryApi, productApi } from '../../services/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useSubmit } from '../../hooks/index.js';
import { finalPrice, toFa, toman } from '../../utils/format.js';
import SmartImage from '../../components/ui/SmartImage.jsx';

const EMPTY = {
  name: '', shortDescription: '', description: '', category: '', price: '', discount: 0, stock: '',
  unit: 'گرم', weight: 100, origin: '', usage: '', ingredients: '', benefits: '',
  images: [], isFeatured: false, isPopular: false, isActive: true,
};

export default function ProductForm() {
  const { id } = useParams();
  const { pathname } = useLocation();
  // مسیر /admin/products/new پارامتر id ندارد، پس فقط به useParams تکیه نکن.
  const isNew = id === 'new' || pathname.endsWith('/products/new');
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!isNew);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    categoryApi.list({ all: 'true' }).then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) return;
    productApi.get(id).then(({ data }) => {
      const p = data.product;
      setForm({
        ...EMPTY, ...p,
        category: p.category?._id || '',
        ingredients: (p.ingredients || []).join('، '),
        benefits: (p.benefits || []).join('، '),
      });
      setLoading(false);
    }).catch((err) => { toast.error(err.message); navigate('/admin/products'); });
    // eslint-disable-next-line
  }, [id]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const upload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).slice(0, 6).forEach((f) => fd.append('images', f));
      const { data } = await productApi.uploadImages(fd);
      set({ images: [...form.images, ...data.images].slice(0, 6) });
      toast.success('تصویر اضافه شد');
    } catch (err) { toast.error(err.message); } finally { setUploading(false); }
  };

  const [save, saving] = useSubmit(async (e) => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 3) next.name = 'نام محصول الزامی است';
    if (!form.category) next.category = 'دسته‌بندی را انتخاب کنید';
    if (form.description.trim().length < 20) next.description = 'توضیحات حداقل ۲۰ کاراکتر باشد';
    if (!(Number(form.price) > 0)) next.price = 'قیمت معتبر وارد کنید';
    if (form.stock === '' || Number(form.stock) < 0) next.stock = 'موجودی معتبر وارد کنید';
    setErrors(next);
    if (Object.keys(next).length) { toast.error('چند فیلد نیاز به اصلاح دارد'); return; }

    const payload = {
      name: form.name.trim(),
      shortDescription: form.shortDescription?.trim() || undefined,
      description: form.description.trim(),
      category: form.category,
      price: Number(form.price),
      discount: Number(form.discount) || 0,
      stock: Number(form.stock),
      unit: form.unit || undefined,
      weight: Number(form.weight) || undefined,
      origin: form.origin?.trim() || undefined,
      usage: form.usage?.trim() || undefined,
      ingredients: form.ingredients ? form.ingredients.split(/[،,]/).map((s) => s.trim()).filter(Boolean) : [],
      benefits: form.benefits ? form.benefits.split(/[،,]/).map((s) => s.trim()).filter(Boolean) : [],
      images: form.images.map((i) => ({ url: i.url, alt: i.alt || form.name })),
      isFeatured: form.isFeatured, isPopular: form.isPopular, isActive: form.isActive,
    };

    try {
      if (isNew) {
        await productApi.create(payload);
        toast.success('محصول ایجاد شد');
      } else {
        await productApi.update(id, payload);
        toast.success('محصول به‌روزرسانی شد');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message);
      setErrors(err.details || {});
    }
  });

  if (loading) {
    return <div className="space-y-4 max-w-3xl">{Array.from({ length: 6 }).map((_, i) => <SkeletonBlock key={i} className="h-12 w-full" />)}</div>;
  }

  const preview = finalPrice({ price: Number(form.price) || 0, discount: Number(form.discount) || 0 });

  return (
    <>
      <Seo title={isNew ? 'محصول جدید' : `ویرایش ${form.name}`} />
      <Link to="/admin/products" className="mb-5 inline-flex items-center gap-2 text-sm text-ink-500 hover:text-moss-700">
        <FiArrowRight size={16} /> بازگشت به محصولات
      </Link>

      <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{isNew ? 'محصول جدید' : 'ویرایش محصول'}</h1>

      <form onSubmit={save} className="mt-7 grid gap-7 xl:grid-cols-[1fr_20rem]" noValidate>
        <div className="space-y-6">
          <section className="rounded-2xl border hairline bg-bone-50 p-5 sm:p-6">
            <h2 className="text-base font-bold">اطلاعات اصلی</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input className="sm:col-span-2" label="نام محصول" value={form.name} error={errors.name} onChange={(e) => set({ name: e.target.value })} />
              <Input className="sm:col-span-2" label="توضیح کوتاه" maxLength={240} hint="یک خط برای کارت محصول" value={form.shortDescription || ''} onChange={(e) => set({ shortDescription: e.target.value })} />
              <div className="sm:col-span-2">
                <label className="label" htmlFor="desc">توضیحات کامل</label>
                <textarea id="desc" rows={6} value={form.description} onChange={(e) => set({ description: e.target.value })} className={`field h-auto resize-y py-3 leading-8 ${errors.description ? 'field-error' : ''}`} />
                {errors.description && <p className="mt-1.5 text-xs text-berry-600">{errors.description}</p>}
              </div>
              <div>
                <label className="label" htmlFor="cat">دسته‌بندی</label>
                <select id="cat" value={form.category} onChange={(e) => set({ category: e.target.value })} className={`field ${errors.category ? 'field-error' : ''}`}>
                  <option value="">انتخاب کنید</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {errors.category && <p className="mt-1.5 text-xs text-berry-600">{errors.category}</p>}
              </div>
              <Input label="خاستگاه" value={form.origin || ''} onChange={(e) => set({ origin: e.target.value })} />
              <Input label="ترکیبات" hint="با ویرگول جدا کنید" value={form.ingredients} onChange={(e) => set({ ingredients: e.target.value })} />
              <Input label="ویژگی‌ها" hint="با ویرگول جدا کنید" value={form.benefits} onChange={(e) => set({ benefits: e.target.value })} />
              <div className="sm:col-span-2">
                <label className="label" htmlFor="usage">نحوه مصرف</label>
                <textarea id="usage" rows={3} value={form.usage || ''} onChange={(e) => set({ usage: e.target.value })} className="field h-auto resize-none py-3 leading-7" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border hairline bg-bone-50 p-5 sm:p-6">
            <h2 className="text-base font-bold">تصاویر</h2>
            <p className="mt-1.5 text-xs text-ink-400">حداکثر ۶ تصویر، هر کدام تا ۲ مگابایت (JPG، PNG، WEBP، AVIF)</p>

            <div className="mt-5 flex flex-wrap gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="group relative size-24 overflow-hidden rounded-xl border hairline">
                  <SmartImage src={img.url} alt="" className="size-full object-cover" fallbackLabel="خراب" />
                  <button
                    type="button"
                    onClick={() => set({ images: form.images.filter((_, idx) => idx !== i) })}
                    aria-label="حذف تصویر"
                    className="absolute left-1.5 top-1.5 grid size-10 place-items-center rounded-xl bg-ink-900/85 text-bone-50 shadow-card transition-[background-color,transform] active:scale-95 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                  >
                    <FiTrash2 size={18} />
                  </button>
                  {i === 0 && <span className="absolute inset-x-0 bottom-0 bg-moss-900/85 py-1 text-center text-[0.6rem] text-bone-50">تصویر اصلی</span>}
                </div>
              ))}

              {form.images.length < 6 && (
                <label className="grid size-24 cursor-pointer place-items-center rounded-xl border border-dashed border-bone-300 text-ink-400 transition-colors hover:border-moss-300 hover:text-moss-700">
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
                  <span className="flex flex-col items-center gap-1 text-2xs">
                    <FiUploadCloud size={20} />
                    {uploading ? 'در حال آپلود…' : 'افزودن'}
                  </span>
                </label>
              )}
            </div>

            <div className="mt-4">
              <Input
                label="یا آدرس تصویر را وارد کنید"
                placeholder="https://…"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.startsWith('http')) {
                    e.preventDefault();
                    set({ images: [...form.images, { url: e.target.value }].slice(0, 6) });
                    e.target.value = '';
                  }
                }}
                hint="بعد از تایپ، Enter بزنید"
              />
            </div>
          </section>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-2xl border hairline bg-bone-50 p-5">
            <h2 className="text-base font-bold">قیمت و موجودی</h2>
            <div className="mt-5 space-y-4">
              <Input label="قیمت (تومان)" inputMode="numeric" className="num" value={form.price} error={errors.price} onChange={(e) => set({ price: e.target.value })} />
              <Input label="درصد تخفیف" inputMode="numeric" className="num" value={form.discount} onChange={(e) => set({ discount: e.target.value })} hint={Number(form.discount) > 0 ? `قیمت نهایی: ${toman(preview)}` : 'بین ۰ تا ۹۰'} />
              <Input label="موجودی" inputMode="numeric" className="num" value={form.stock} error={errors.stock} onChange={(e) => set({ stock: e.target.value })} />
              <div className="grid gap-3 min-[390px]:grid-cols-2">
                <Input label="وزن" inputMode="numeric" className="num" value={form.weight} onChange={(e) => set({ weight: e.target.value })} />
                <Input label="واحد" value={form.unit} onChange={(e) => set({ unit: e.target.value })} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border hairline bg-bone-50 p-5">
            <h2 className="text-base font-bold">نمایش</h2>
            <div className="mt-4 space-y-3 text-sm">
              {[
                ['isActive', 'فعال در فروشگاه'],
                ['isFeatured', 'نمایش در محصولات ویژه'],
                ['isPopular', 'نمایش در محبوب‌ها'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2.5">
                  <input type="checkbox" checked={Boolean(form[key])} onChange={(e) => set({ [key]: e.target.checked })} className="size-4 accent-moss-700" />
                  {label}
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-3 min-[390px]:flex-row">
            <Button type="submit" size="md" className="flex-1" loading={saving}>{isNew ? 'ایجاد محصول' : 'ذخیره تغییرات'}</Button>
            <Button type="button" variant="ghost" size="md" onClick={() => navigate('/admin/products')}>انصراف</Button>
          </div>
          {!isNew && <p className="num text-center text-2xs text-ink-400">شناسه: {toFa(id.slice(-6))}</p>}
        </div>
      </form>
    </>
  );
}
