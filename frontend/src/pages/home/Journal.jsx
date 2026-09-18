import { Link } from 'react-router-dom';
import SectionHeader from './SectionHeader.jsx';
import { toFa } from '../../utils/format.js';
import SmartImage from '../../components/ui/SmartImage.jsx';

const ARTICLES = [
  {
    slug: 'khavas-giahan-daroei',
    title: 'خواص گیاهان دارویی که بیشتر از همه اشتباه مصرف می‌شوند',
    excerpt: 'گاوزبان زیاد فشار را می‌اندازد و سنا را نباید هر شب خورد. راهنمای مقدار درست.',
    minutes: 7,
    image: '/images/products/gol-gavzaban.jpg',
    tag: 'گیاه‌شناسی',
  },
  {
    slug: 'rahnamaye-damnoosh',
    title: 'راهنمای انتخاب دمنوش بر اساس ساعت روز',
    excerpt: 'صبح چای سبز، عصر بابونه، شب گاوزبان. چرا ترتیب مهم است؟',
    minutes: 5,
    image: '/images/products/babouneh.jpg',
    tag: 'دمنوش',
  },
  {
    slug: 'entekhab-advieh',
    title: 'چگونه ادویه اصل را از تقلبی تشخیص دهیم؟',
    excerpt: 'زردچوبه آردی، زعفران رنگ‌شده و دارچین کاسیا: سه آزمایش ساده خانگی.',
    minutes: 6,
    image: '/images/products/darchin-seylan.jpg',
    tag: 'ادویه',
  },
];

export default function Journal() {
  return (
    <section className="wrap py-16 sm:py-20">
      <SectionHeader
        eyebrow="مجله گیاهان"
        title="قبل از خرید، بهتر انتخاب کن"
        description="راهنماهای کوتاه و کاربردی برای شناخت بهتر گیاهان، ادویه‌ها و روش مصرفشان."
        to="/journal"
        linkLabel="همه مقاله‌ها"
      />

      <div className="grid gap-8 md:grid-cols-3">
        {ARTICLES.map((a, i) => (
          <article key={a.slug} className={`group ${i === 0 ? 'md:col-span-1' : ''}`}>
            <Link to={`/journal/${a.slug}`} className="block overflow-hidden rounded-2xl bg-bone-100">
              <SmartImage
                src={a.image} alt="" loading="lazy" decoding="async" width="900" height="560"
                sizes="(max-width: 768px) 92vw, 30vw"
                className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-105"
                fallbackLabel=""
              />
            </Link>
            <div className="mt-4 flex items-center gap-2 text-2xs text-ink-400">
              <span className="font-semibold text-moss-600">{a.tag}</span>
              <span>·</span>
              <span className="num">{toFa(a.minutes)} دقیقه مطالعه</span>
            </div>
            <h3 className="mt-2 text-[1.05rem] font-bold leading-7">
              <Link to={`/journal/${a.slug}`} className="hover:text-moss-700">{a.title}</Link>
            </h3>
            <p className="mt-2 text-sm leading-7 text-ink-500">{a.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
