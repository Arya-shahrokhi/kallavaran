import { useState } from 'react';
import { FiLock } from 'react-icons/fi';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Seo from '../../components/common/Seo.jsx';
import { authApi } from '../../services/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useSubmit } from '../../hooks/index.js';

export default function Security() {
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', repeat: '' });
  const [errors, setErrors] = useState({});

  const [save, saving] = useSubmit(async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.currentPassword) next.currentPassword = 'رمز فعلی را وارد کنید';
    if (form.newPassword.length < 8) next.newPassword = 'رمز جدید حداقل ۸ کاراکتر باشد';
    else if (!/[A-Za-zآ-ی]/.test(form.newPassword) || !/\d/.test(form.newPassword)) next.newPassword = 'رمز باید حرف و رقم داشته باشد';
    if (form.newPassword !== form.repeat) next.repeat = 'تکرار رمز مطابقت ندارد';
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      const { message } = await authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success(`${message}. نشست‌های دیگر شما بسته شد.`);
      setForm({ currentPassword: '', newPassword: '', repeat: '' });
    } catch (err) {
      toast.error(err.message);
      setErrors(err.details || {});
    }
  });

  return (
    <>
      <Seo title="تغییر رمز عبور" />
      <h1 className="text-xl font-extrabold tracking-tight">تغییر رمز عبور</h1>
      <p className="mt-2 max-w-[52ch] text-sm leading-7 text-ink-500">
        بعد از تغییر رمز، از تمام دستگاه‌های دیگر خارج می‌شوید. همین دستگاه فعال می‌ماند.
      </p>

      <form onSubmit={save} className="mt-7 max-w-md space-y-4" noValidate>
        <Input label="رمز فعلی" type="password" icon={FiLock} autoComplete="current-password" value={form.currentPassword} error={errors.currentPassword} onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))} />
        <Input label="رمز جدید" type="password" icon={FiLock} autoComplete="new-password" value={form.newPassword} error={errors.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} />
        <Input label="تکرار رمز جدید" type="password" icon={FiLock} autoComplete="new-password" value={form.repeat} error={errors.repeat} onChange={(e) => setForm((f) => ({ ...f, repeat: e.target.value }))} />
        <Button type="submit" loading={saving}>تغییر رمز</Button>
      </form>
    </>
  );
}
