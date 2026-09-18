import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiPackage, FiTruck } from 'react-icons/fi';
import SmartImage from '../../components/ui/SmartImage.jsx';

const benefits = [
  { label: 'انتخاب روزمره', Icon: FiPackage },
  { label: 'کیفیت مطمئن', Icon: FiCheck },
  { label: 'ارسال سریع', Icon: FiTruck },
];

const pantry = [
  { src: '/images/products/dedicated/25-berenj-hashemi-organic.webp', alt: 'برنج هاشمی ایرانی', className: 'essentials-shelf__rice' },
  { src: '/images/products/dedicated/10-zaferan-sargol.webp', alt: 'زعفران سرگل', className: 'essentials-shelf__saffron' },
  { src: '/images/products/dedicated/17-roghan-siah-daneh.webp', alt: 'روغن طبیعی', className: 'essentials-shelf__oil' },
];

export default function EssentialsShelf() {
  return (
    <section className="essentials-shelf relative overflow-hidden" data-reveal aria-labelledby="essentials-title">
      <div className="essentials-shelf__pattern absolute inset-0" aria-hidden="true" />
      <div className="wrap relative grid min-h-[34rem] items-center gap-10 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
        <div className="relative z-10 max-w-xl">
          <p className="text-2xs font-extrabold tracking-[.18em] text-moss-700">بخش ویژه کالاوران</p>
          <h2 id="essentials-title" className="mt-4 text-4xl font-black leading-[1.3] tracking-tight text-ink-900 sm:text-5xl">ملزومات هر روز خانه</h2>
          <p className="mt-5 max-w-[54ch] text-base leading-8 text-ink-600">از برنج ایرانی و ادویه تازه تا عرقیات و روغن‌های طبیعی؛ انتخاب‌های ضروری برای یک آشپزخانه کامل.</p>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
            {benefits.map(({ label, Icon }) => (
              <span key={label} className="inline-flex items-center gap-2 text-sm font-bold text-ink-700">
                <span className="grid size-8 place-items-center rounded-full bg-moss-100 text-moss-700"><Icon size={15} aria-hidden="true" /></span>
                {label}
              </span>
            ))}
          </div>

          <Link to="/premium-products" className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-xl bg-moss-800 px-6 py-3 text-sm font-extrabold text-bone-50 shadow-card transition duration-200 ease-expo hover:-translate-y-0.5 hover:bg-moss-900 hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-moss-700">
            خرید کالاهای اساسی
            <FiArrowLeft size={18} aria-hidden="true" />
          </Link>
        </div>

        <div className="essentials-shelf__still-life relative mx-auto h-[25rem] w-full max-w-[40rem] lg:h-[30rem]" aria-label="منتخبی از کالاهای اساسی کالاوران">
          <div className="essentials-shelf__sun absolute left-[12%] top-[4%] size-52 rounded-full" aria-hidden="true" />
          {pantry.map((item) => (
            <div key={item.alt} className={`absolute overflow-hidden rounded-[2rem] bg-bone-50 shadow-lift ${item.className}`}>
              <SmartImage src={item.src} alt={item.alt} loading="lazy" className="size-full object-cover" fallbackLabel="" />
            </div>
          ))}
          <span className="essentials-shelf__stamp absolute grid size-24 -rotate-6 place-items-center rounded-full text-center text-[0.64rem] font-black leading-5 tracking-[.12em] text-bone-50" aria-hidden="true">ضروریِ<br />هر خانه</span>
        </div>
      </div>
    </section>
  );
}
