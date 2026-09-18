import { FiAward, FiHeadphones, FiPackage, FiShield, FiTruck } from 'react-icons/fi';

const ITEMS = [
  { icon: FiAward, title: 'انتخاب‌شده با وسواس', text: 'هر محموله پیش از بسته‌بندی از نظر عطر، ظاهر و تازگی بررسی می‌شود.' },
  { icon: FiTruck, title: 'سریع و قابل پیگیری', text: 'سفارش‌های آماده تا ساعت ۱۴ همان روز تحویل ارسال می‌شوند و وضعیتشان قابل پیگیری است.' },
  { icon: FiPackage, title: 'تازگی تا لحظه مصرف', text: 'بسته‌بندی چندلایه کمک می‌کند عطر، بافت و کیفیت محصول بهتر حفظ شود.' },
  { icon: FiShield, title: 'خرید با خیال راحت', text: 'اگر محصول با توضیحاتش هم‌خوان نبود، تا هفت روز برای پیگیری و بازگشت فرصت دارید.' },
  { icon: FiHeadphones, title: 'راهنمایی قبل از خرید', text: 'برای انتخاب بهتر، درباره کاربرد، مقدار مصرف و روش نگهداری هر محصول راهنمایی می‌کنیم.' },
];

export default function WhyUs() {
  return (
    <section className="bg-bone-100 py-16 sm:py-20">
      <div className="wrap">
        <div className="max-w-2xl">
          <p className="text-2xs font-bold uppercase tracking-[0.14em] text-moss-600">چرا کالاوران</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            می‌دانیم چه چیزی به دستت می‌رسد
          </h2>
        </div>

        {/* لیست غیریکنواخت: اولی عریض‌تر، بقیه فشرده‌تر */}
        <div className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <div key={item.title} className={i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}>
              <span className="grid size-11 place-items-center rounded-xl bg-moss-700 text-bone-50">
                <item.icon size={20} />
              </span>
              <h3 className="mt-4 text-base font-bold">{item.title}</h3>
              <p className="mt-2 max-w-[38ch] text-sm leading-7 text-ink-500">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
