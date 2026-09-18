import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiCreditCard, FiMapPin, FiPlus, FiTruck } from 'react-icons/fi';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import CartSummary from '../components/cart/CartSummary.jsx';
import Badge from '../components/ui/Badge.jsx';
import Seo from '../components/common/Seo.jsx';
import { authApi, orderApi } from '../services/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useSubmit } from '../hooks/index.js';
import { toFa, toman } from '../utils/format.js';
import SmartImage from '../components/ui/SmartImage.jsx';

const PROVINCES = ['تهران', 'البرز', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی', 'گیلان', 'مازندران', 'یزد', 'کرمان', 'خوزستان', 'قم'];

const EMPTY = { receiver: '', phone: '', province: 'تهران', city: '', postalCode: '', line: '', note: '' };

const toEnglishDigits = (value) => String(value ?? '')
  .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
  .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

export default function Checkout() {
  const { user, setUser } = useAuth();
  const { cart, refresh } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [method, setMethod] = useState('COD');
  const [placed, setPlaced] = useState(null);

  useEffect(() => {
    authApi.addresses().then(({ data }) => {
      setAddresses(data.addresses);
      const def = data.addresses.find((a) => a.isDefault) || data.addresses[0];
      if (def) setSelected(def._id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!cart.items.length && !placed) navigate('/cart', { replace: true });
  }, [cart.items.length, placed, navigate]);

  const useNew = selected === null;

  const [submit, submitting] = useSubmit(async (e) => {
    e.preventDefault();
    setErrors({});

    const payload = { paymentMethod: method };
    if (useNew) {
      const next = {};
      if (form.receiver.trim().length < 3) next.receiver = 'نام گیرنده را کامل بنویسید';
      if (!/^09\d{9}$/.test(toEnglishDigits(form.phone))) next.phone = 'شماره موبایل ۱۱ رقمی و با ۰۹ شروع شود';
      if (form.city.trim().length < 2) next.city = 'شهر الزامی است';
      if (!/^\d{10}$/.test(toEnglishDigits(form.postalCode))) next.postalCode = 'کد پستی باید ۱۰ رقم باشد';
      if (form.line.trim().length < 10) next.line = 'آدرس را کامل‌تر بنویسید';
      if (Object.keys(next).length) { setErrors(next); return; }
      payload.shippingAddress = {
        receiver: form.receiver.trim(), phone: toEnglishDigits(form.phone), province: form.province,
        city: form.city.trim(), postalCode: toEnglishDigits(form.postalCode), line: form.line.trim(),
        note: form.note?.trim() || undefined,
      };
    } else {
      // آدرس ذخیره‌شده: سرور خودش فیلدها را از حساب کاربر می‌خواند
      payload.addressId = selected;
    }

    try {
      const { data } = await orderApi.create(payload);
      // ذخیره آدرس جدید برای بارهای بعد
      if (useNew) {
        try {
          const { data: aData } = await authApi.addAddress({ ...form, note: undefined, title: 'آدرس اخیر' });
          setUser((u) => ({ ...u, addresses: aData.addresses }));
        } catch { /* اختیاری */ }
      }
      await refresh();
      setPlaced(data.order);
      if (data.redirectUrl) window.location.assign(data.redirectUrl);
    } catch (err) {
      toast.error(err.message);
      if (err.details) setErrors(err.details);
    }
  });

  if (placed) {
    return (
      <div className="wrap py-16">
        <Seo title="سفارش ثبت شد" />
        <div className="mx-auto max-w-xl text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-moss-100 text-moss-700"><FiCheckCircle size={32} /></span>
          <h1 className="mt-6 text-2xl font-extrabold">سفارش شما ثبت شد</h1>
          <p className="num mt-3 text-sm leading-7 text-ink-500">
            شماره سفارش: <span className="font-bold text-ink-900">{placed.orderNumber}</span>
            <br />مبلغ {toman(placed.total)} · پرداخت {method === 'COD' ? 'در محل' : 'اینترنتی'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to={`/account/orders/${placed._id}`}>پیگیری سفارش</Button>
            <Button to="/products" variant="outline">ادامه خرید</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo title="تکمیل خرید" />
      <div className="wrap py-9 sm:py-12">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">تکمیل خرید</h1>

        <form onSubmit={submit} className="mt-8 grid gap-10 lg:grid-cols-[1fr_23rem]" noValidate>
          <div className="space-y-9">
            <section>
              <h2 className="flex items-center gap-2 text-base font-bold"><FiMapPin size={17} className="text-moss-600" /> آدرس تحویل</h2>

              {addresses.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {addresses.map((a) => (
                    <label
                      key={a._id}
                      className={`cursor-pointer rounded-2xl border p-4 transition-colors ${
                        selected === a._id ? 'border-moss-600 bg-moss-50' : 'border-bone-300 hover:border-ink-300'
                      }`}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <input type="radio" name="address" checked={selected === a._id} onChange={() => setSelected(a._id)} className="accent-moss-700" />
                          <span className="text-sm font-semibold">{a.title}</span>
                        </span>
                        {a.isDefault && <Badge tone="moss">پیش‌فرض</Badge>}
                      </span>
                      <span className="mt-2.5 block text-xs leading-6 text-ink-500">
                        {a.province}، {a.city}، {a.line}
                        <span className="num mt-1 block text-ink-400">{a.receiver} · {a.phone}</span>
                      </span>
                    </label>
                  ))}

                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className={`flex min-h-[6.5rem] items-center justify-center gap-2 rounded-2xl border border-dashed text-sm font-medium transition-colors ${
                      useNew ? 'border-moss-600 bg-moss-50 text-moss-900' : 'border-bone-300 text-ink-400 hover:border-moss-300 hover:text-moss-700'
                    }`}
                  >
                    <FiPlus size={17} /> آدرس جدید
                  </button>
                </div>
              )}

              {useNew && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Input label="نام و نام خانوادگی گیرنده" value={form.receiver} error={errors.receiver} onChange={(e) => setForm((f) => ({ ...f, receiver: e.target.value }))} />
                  <Input label="شماره موبایل" inputMode="numeric" placeholder="09121234567" className="num" value={form.phone} error={errors.phone} onChange={(e) => setForm((f) => ({ ...f, phone: toEnglishDigits(e.target.value) }))} />
                  <div>
                    <label className="label" htmlFor="province">استان</label>
                    <select id="province" value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))} className="field">
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <Input label="شهر" value={form.city} error={errors.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                  <Input label="کد پستی" inputMode="numeric" maxLength={10} className="num" value={form.postalCode} error={errors.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: toEnglishDigits(e.target.value) }))} />
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="line">نشانی کامل</label>
                    <textarea id="line" rows={3} value={form.line} onChange={(e) => setForm((f) => ({ ...f, line: e.target.value }))}
                      placeholder="خیابان، کوچه، پلاک، واحد"
                      className={`field h-auto resize-none py-3 leading-7 ${errors.line ? 'field-error' : ''}`} />
                    {errors.line && <p className="mt-1.5 text-xs text-berry-600">{errors.line}</p>}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="label" htmlFor="note">یادداشت برای پیک (اختیاری)</label>
                <input id="note" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} className="field" placeholder="مثلاً زنگ واحد ۳ خراب است" />
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-base font-bold"><FiCreditCard size={17} className="text-moss-600" /> روش پرداخت</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { key: 'COD', title: 'پرداخت در محل', text: 'هنگام تحویل، نقدی یا کارت‌خوان سیار.', ready: true },
                  { key: 'GATEWAY', title: 'پرداخت اینترنتی', text: 'اتصال درگاه بانکی در حال راه‌اندازی است.', ready: false },
                ].map((opt) => (
                  <label
                    key={opt.key}
                    className={`rounded-2xl border p-4 transition-colors ${!opt.ready ? 'cursor-not-allowed opacity-55' : 'cursor-pointer'} ${
                      method === opt.key ? 'border-moss-600 bg-moss-50' : 'border-bone-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input type="radio" name="pay" disabled={!opt.ready} checked={method === opt.key} onChange={() => setMethod(opt.key)} className="accent-moss-700" />
                      <span className="text-sm font-semibold">{opt.title}</span>
                    </span>
                    <span className="mt-2 block text-xs leading-6 text-ink-500">{opt.text}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border hairline bg-bone-100 p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold"><FiTruck size={16} className="text-moss-600" /> کالاهای سفارش</h2>
              <ul className="mt-4 divide-y hairline">
                {cart.items.map((i) => (
                  <li key={i._id} className="flex items-center gap-3 py-3">
                    <SmartImage src={i.product.image} alt="" loading="lazy" className="size-12 rounded-lg object-cover" fallbackLabel="" />
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="block truncate font-medium">{i.product.name}</span>
                      <span className="num text-xs text-ink-400">{toFa(i.quantity)} × {toman(i.unitPrice)}</span>
                    </span>
                    <span className="num text-sm font-semibold">{toman(i.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
            <CartSummary cart={cart} showShippingBar={false}>
              <Button type="submit" size="lg" className="w-full" loading={submitting}>ثبت نهایی سفارش</Button>
              <p className="text-center text-2xs leading-6 text-ink-400">
                سبد خود را عوض کردید؟ <Link to="/cart" className="text-moss-700 underline">بازگشت به سبد</Link>
              </p>
            </CartSummary>
          </div>
        </form>
      </div>
    </>
  );
}
