import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiLock, FiUser } from 'react-icons/fi';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Logo from '../components/layout/Logo.jsx';
import Seo from '../components/common/Seo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useSubmit } from '../hooks/index.js';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});

  const [submit, submitting] = useSubmit(async (e) => {
    e.preventDefault();
    const next = {};
    if (form.identifier.trim().length < 3) next.identifier = 'ایمیل یا شماره موبایل را وارد کنید';
    if (!form.password) next.password = 'رمز عبور را وارد کنید';
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      const message = await login({ identifier: form.identifier.trim(), password: form.password });
      toast.success(message);
      navigate(params.get('redirect') || '/', { replace: true });
    } catch (err) {
      toast.error(err.message);
      setErrors(err.details || {});
    }
  });

  return (
    <>
      <Seo title="ورود به حساب" description="ورود به حساب کاربری کالاوران" />
      <div className="wrap grid min-h-[calc(100dvh-var(--header-h))] items-center py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center">
            <Logo className="mx-auto size-11 text-moss-700" />
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight">خوش برگشتید</h1>
            <p className="mt-2 text-sm text-ink-500">با ایمیل یا شماره موبایل خود وارد شوید.</p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <Input
              label="ایمیل یا شماره موبایل" icon={FiUser} autoComplete="username"
              value={form.identifier} error={errors.identifier}
              onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
            />
            <Input
              label="رمز عبور" type="password" icon={FiLock} autoComplete="current-password"
              value={form.password} error={errors.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
            <Button type="submit" size="lg" className="w-full" loading={submitting}>ورود</Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            حساب ندارید؟ <Link to="/register" className="font-semibold text-moss-700 hover:underline">ثبت‌نام کنید</Link>
          </p>
        </div>
      </div>
    </>
  );
}
