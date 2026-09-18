import { useEffect, useState } from 'react';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Seo from '../../components/common/Seo.jsx';
import { authApi, orderApi } from '../../services/endpoints.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useSubmit } from '../../hooks/index.js';
import { faDate, toFa, toman } from '../../utils/format.js';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [errors, setErrors] = useState({});
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    orderApi.mine({ limit: 50 }).then(({ data }) => {
      const active = data.orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.orderStatus)).length;
      const spent = data.orders.filter((o) => o.orderStatus !== 'CANCELLED').reduce((s, o) => s + o.total, 0);
      setSummary({ count: data.meta.total, active, spent });
    }).catch(() => {});
  }, []);

  const [save, saving] = useSubmit(async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const { data, message } = await authApi.updateMe(form);
      setUser(data.user);
      toast.success(message);
    } catch (err) {
      toast.error(err.message);
      setErrors(err.details || {});
    }
  });

  return (
    <>
      <Seo title="اطلاعات حساب" />
      <h1 className="text-xl font-extrabold tracking-tight">اطلاعات حساب</h1>

      {summary && (
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['سفارش‌ها', toFa(summary.count)],
            ['در جریان', toFa(summary.active)],
            ['مجموع خرید', toman(summary.spent)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border hairline bg-bone-100 px-4 py-3.5">
              <dt className="text-xs text-ink-400">{k}</dt>
              <dd className="num mt-1 text-lg font-bold">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      <form onSubmit={save} className="mt-8 max-w-xl space-y-4" noValidate>
        <Input label="نام و نام خانوادگی" value={form.name} error={errors.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Input label="ایمیل" type="email" value={form.email} error={errors.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <Input label="شماره موبایل" className="num" value={form.phone} error={errors.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" loading={saving}>ذخیره تغییرات</Button>
          <p className="text-xs text-ink-400">عضو از {faDate(user?.createdAt)}</p>
        </div>
      </form>
    </>
  );
}
