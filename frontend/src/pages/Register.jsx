import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiPhone, FiUser } from 'react-icons/fi';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Logo from '../components/layout/Logo.jsx';
import Seo from '../components/common/Seo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useSubmit } from '../hooks/index.js';

const strength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) score++;
  if (pw.length >= 12) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const LABELS = ['خیلی ضعیف', 'ضعیف', 'قابل قبول', 'خوب', 'قوی'];

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});

  const score = strength(form.password);

  const [submit, submitting] = useSubmit(async (e) => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 3) next.name = 'نام کامل خود را بنویسید';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'ایمیل معتبر نیست';
    if (!/^09\d{9}$/.test(form.phone)) next.phone = 'شماره موبایل با ۰۹ شروع شود و ۱۱ رقم باشد';
    if (form.password.length < 8) next.password = 'رمز عبور حداقل ۸ کاراکتر باشد';
    else if (!/[A-Za-zآ-ی]/.test(form.password) || !/\d/.test(form.password)) next.password = 'رمز باید حرف و رقم داشته باشد';
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      const message = await register({ ...form, name: form.name.trim(), email: form.email.trim() });
      toast.success(message);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message);
      setErrors(err.details || {});
    }
  });

  return (
    <>
      <Seo title="ساخت حساب" description="ثبت‌نام در کالاوران" />
      <div className="wrap grid min-h-[calc(100dvh-var(--header-h))] items-center py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center">
            <Logo className="mx-auto size-11 text-moss-700" />
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight">ساخت حساب</h1>
            <p className="mt-2 text-sm text-ink-500">یک بار ثبت‌نام، بعد از آن سفارش در دو کلیک.</p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <Input label="نام و نام خانوادگی" icon={FiUser} value={form.name} error={errors.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="ایمیل" type="email" icon={FiMail} autoComplete="email" value={form.email} error={errors.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input label="شماره موبایل" icon={FiPhone} inputMode="numeric" placeholder="09121234567" className="num" value={form.phone} error={errors.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <div>
              <Input label="رمز عبور" type="password" icon={FiLock} autoComplete="new-password" value={form.password} error={errors.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
              {form.password && !errors.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-200 ${i < score ? (score <= 1 ? 'bg-berry-600' : score === 2 ? 'bg-saffron-500' : 'bg-moss-600') : 'bg-bone-200'}`} />
                    ))}
                  </div>
                  <span className="text-2xs text-ink-400">{LABELS[score]}</span>
                </div>
              )}
            </div>
            <Button type="submit" size="lg" className="w-full" loading={submitting}>ثبت‌نام</Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            حساب دارید؟ <Link to="/login" className="font-semibold text-moss-700 hover:underline">وارد شوید</Link>
          </p>
        </div>
      </div>
    </>
  );
}
