import { useEffect, useState } from 'react';
import { FiEdit2, FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Seo from '../../components/common/Seo.jsx';
import { authApi } from '../../services/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSubmit } from '../../hooks/index.js';

const PROVINCES = ['تهران', 'البرز', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی', 'گیلان', 'مازندران', 'یزد', 'کرمان', 'خوزستان', 'قم'];
const EMPTY = { title: 'خانه', receiver: '', phone: '', province: 'تهران', city: '', postalCode: '', line: '', isDefault: false };

export default function Addresses() {
  const { setUser } = useAuth();
  const toast = useToast();
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [removeId, setRemoveId] = useState(null);

  const sync = (list) => { setAddresses(list); setUser((u) => ({ ...u, addresses: list })); };

  useEffect(() => { authApi.addresses().then(({ data }) => setAddresses(data.addresses)).catch(() => {}); }, []);

  const open = (address) => {
    setEditing(address || 'new');
    setForm(address ? { ...address } : EMPTY);
    setErrors({});
  };

  const [save, saving] = useSubmit(async (e) => {
    e.preventDefault();
    const next = {};
    if (form.receiver.trim().length < 3) next.receiver = 'نام گیرنده الزامی است';
    if (!/^09\d{9}$/.test(form.phone)) next.phone = 'موبایل ۱۱ رقمی با ۰۹';
    if (form.city.trim().length < 2) next.city = 'شهر الزامی است';
    if (!/^\d{10}$/.test(form.postalCode)) next.postalCode = 'کد پستی ۱۰ رقمی';
    if (form.line.trim().length < 10) next.line = 'آدرس را کامل‌تر بنویسید';
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload = {
      title: form.title || 'آدرس من', receiver: form.receiver.trim(), phone: form.phone,
      province: form.province, city: form.city.trim(), postalCode: form.postalCode,
      line: form.line.trim(), isDefault: Boolean(form.isDefault),
    };

    try {
      const res = editing === 'new' ? await authApi.addAddress(payload) : await authApi.updateAddress(editing._id, payload);
      sync(res.data.addresses);
      toast.success(res.message);
      setEditing(null);
    } catch (err) {
      toast.error(err.message);
      setErrors(err.details || {});
    }
  });

  const remove = async () => {
    try {
      const { data, message } = await authApi.removeAddress(removeId);
      sync(data.addresses);
      toast.success(message);
    } catch (err) { toast.error(err.message); } finally { setRemoveId(null); }
  };

  return (
    <>
      <Seo title="آدرس‌ها" />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-extrabold tracking-tight">آدرس‌ها</h1>
        <Button size="sm" icon={FiPlus} onClick={() => open(null)}>آدرس جدید</Button>
      </div>

      {addresses.length === 0 ? (
        <div className="mt-6 rounded-2xl border hairline bg-bone-100">
          <EmptyState icon={FiMapPin} title="آدرسی ذخیره نشده" description="یک آدرس ثبت کنید تا در خریدهای بعدی سریع‌تر باشید." action="افزودن آدرس" onAction={() => open(null)} />
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a._id} className="rounded-2xl border hairline bg-bone-50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold">
                    {a.title}
                    {a.isDefault && <Badge tone="moss">پیش‌فرض</Badge>}
                  </p>
                  <p className="mt-2.5 text-xs leading-6 text-ink-500">
                    {a.province}، {a.city}، {a.line}
                    <span className="num mt-1 block text-ink-400">{a.receiver} · {a.phone} · کد پستی {a.postalCode}</span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => open(a)} aria-label="ویرایش" className="rounded-lg p-2 text-ink-400 hover:bg-moss-50 hover:text-moss-700"><FiEdit2 size={15} /></button>
                  <button onClick={() => setRemoveId(a._id)} aria-label="حذف" className="rounded-lg p-2 text-ink-400 hover:bg-berry-100 hover:text-berry-600"><FiTrash2 size={15} /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'آدرس جدید' : 'ویرایش آدرس'}
        footer={(
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>انصراف</Button>
            <Button size="sm" loading={saving} onClick={save}>ذخیره</Button>
          </>
        )}
      >
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Input label="عنوان" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Input label="نام گیرنده" value={form.receiver} error={errors.receiver} onChange={(e) => setForm((f) => ({ ...f, receiver: e.target.value }))} />
          <Input label="موبایل" className="num" value={form.phone} error={errors.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <div>
            <label className="label" htmlFor="prov">استان</label>
            <select id="prov" value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))} className="field">
              {PROVINCES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <Input label="شهر" value={form.city} error={errors.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          <Input label="کد پستی" className="num" maxLength={10} value={form.postalCode} error={errors.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} />
          <div className="sm:col-span-2">
            <label className="label" htmlFor="line2">نشانی کامل</label>
            <textarea id="line2" rows={3} value={form.line} onChange={(e) => setForm((f) => ({ ...f, line: e.target.value }))} className={`field h-auto resize-none py-3 leading-7 ${errors.line ? 'field-error' : ''}`} />
            {errors.line && <p className="mt-1.5 text-xs text-berry-600">{errors.line}</p>}
          </div>
          <label className="flex items-center gap-2.5 text-sm sm:col-span-2">
            <input type="checkbox" checked={Boolean(form.isDefault)} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} className="size-4 accent-moss-700" />
            این آدرس پیش‌فرض من باشد
          </label>
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(removeId)} onClose={() => setRemoveId(null)} onConfirm={remove} title="حذف آدرس" description="این آدرس از حساب شما حذف می‌شود." confirmText="حذف کن" />
    </>
  );
}
