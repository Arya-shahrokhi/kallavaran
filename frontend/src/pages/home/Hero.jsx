import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiPhone } from 'react-icons/fi';
import Logo from '../../components/layout/Logo.jsx';

const PROOF = ['تازه و فصل‌مند', 'ترکیب شفاف', 'ارسال سریع'];

export default function Hero() {
  return (
    <section className="geo-hero relative overflow-hidden bg-moss-900 text-bone-50" data-reveal>
      <div className="geo-grid absolute inset-0 opacity-30" aria-hidden="true" />
      <span className="geo-shape geo-shape-a hero-orbit" aria-hidden="true" />
      <span className="geo-shape geo-shape-b hero-pulse" aria-hidden="true" />
      <span className="geo-shape geo-shape-c hero-drift" aria-hidden="true" />
      <div className="wrap relative grid min-h-[38rem] items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_.95fr]">
        <div className="max-w-2xl animate-fade-up">
          <span className="inline-flex items-center gap-2 border border-bone-50/25 px-3 py-2 text-xs font-bold tracking-wide text-bone-100">
            <Logo className="size-5 text-berry-600" /> کالاوران · انتخاب طبیعی
          </span>
          <h1 className="mt-6 text-[clamp(2.2rem,7vw,4.25rem)] font-extrabold leading-[1.12] tracking-tight">
            هر انتخاب، دقیق‌تر از قبل،<br />با عطر و طعم واقعی
          </h1>
          <p className="mt-5 max-w-[46ch] text-base leading-8 text-bone-100/80 sm:text-lg">
            از گیاه دارویی و ادویه تازه تا عرقیات سنتی و روغن پرس سرد؛ هر محصول با دقت انتخاب و با اطلاعات روشن ارسال می‌شود.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/products" className="btn-accent btn-lg">شروع انتخاب <FiArrowLeft size={19} /></Link>
            <Link to="/journal" className="btn btn-lg border border-bone-50/25 text-bone-50 hover:bg-bone-50/10">راهنمای انتخاب</Link>
          </div>
          <a href="tel:09027403331" className="mt-8 inline-flex w-fit items-center gap-3 rounded-2xl border border-bone-50/25 bg-bone-50/10 px-4 py-3 text-bone-50 transition-colors duration-200 hover:bg-bone-50/20" aria-label="تماس با کالاوران">
            <span className="grid size-10 place-items-center rounded-xl bg-saffron-500 text-ink-900"><FiPhone size={19} /></span>
            <span>
              <span className="block text-xs font-medium text-bone-100/70">پشتیبانی و سفارش تلفنی</span>
              <span className="num mt-0.5 block text-xl font-extrabold tracking-wide dir-ltr">09027403331</span>
            </span>
          </a>
          <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-bone-100/75">
            {PROOF.map((item) => <li key={item} className="flex items-center gap-2"><FiCheck className="text-saffron-500" size={16} />{item}</li>)}
          </ul>
        </div>
        <div className="relative hidden min-h-[28rem] lg:block" aria-hidden="true">
          <div className="hero-orbit absolute left-10 top-2 size-72 rotate-12 border border-bone-50/30" />
          <div className="hero-drift absolute left-24 top-16 size-72 rotate-45 bg-saffron-500" />
          <div className="hero-pulse absolute left-40 top-28 size-72 -rotate-12 bg-bone-50/10" />
          <Logo className="absolute left-[8.8rem] top-[8.2rem] z-10 size-52 -rotate-6 text-berry-600" />
          <div className="absolute bottom-2 left-0 grid size-28 place-items-center border border-bone-50/25 text-center text-xs font-bold leading-6 text-bone-100">خالص<br />سنجیده<br />تازه</div>
        </div>
      </div>
    </section>
  );
}
