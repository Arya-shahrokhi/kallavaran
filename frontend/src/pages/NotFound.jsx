import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Seo from '../components/common/Seo.jsx';
import { toFa } from '../utils/format.js';

export default function NotFound() {
  return (
    <>
      <Seo title="صفحه پیدا نشد" />
      <div className="wrap grid min-h-[70dvh] place-items-center py-16 text-center">
        <div>
          <p className="num text-[clamp(4rem,18vw,9rem)] font-extrabold leading-none text-moss-100">{toFa(404)}</p>
          <h1 className="-mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">این قفسه خالی است</h1>
          <p className="mx-auto mt-4 max-w-[44ch] text-sm leading-8 text-ink-500">
            صفحه‌ای که دنبالش بودید جابه‌جا شده یا هرگز وجود نداشته. از فهرست محصولات شروع کنید.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/products" className="btn-primary btn-md">مشاهده محصولات <FiArrowLeft size={17} /></Link>
            <Link to="/" className="btn-outline btn-md">صفحه اصلی</Link>
          </div>
        </div>
      </div>
    </>
  );
}
