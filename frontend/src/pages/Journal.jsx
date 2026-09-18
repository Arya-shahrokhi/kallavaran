import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiClock, FiSearch } from 'react-icons/fi';
import Seo from '../components/common/Seo.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import SmartImage from '../components/ui/SmartImage.jsx';
import { useReveal } from '../hooks/index.js';
import { faDate, toFa } from '../utils/format.js';

/**
 * این فایل خالی بود در حالی که هدر، فوتر و صفحه‌ی خانه به /journal لینک
 * می‌دادند؛ یعنی چهار لینک در سایت به یک صفحه‌ی سفید می‌رسید.
 *
 * محتوا فعلاً ساکن است (بک‌اند مدل مقاله ندارد). ساختار طوری است که
 * جایگزینی با API فقط عوض کردن منبع ARTICLES است.
 */
const ARTICLES = [
  {
    slug: 'khavas-giahan-daroei',
    title: 'خواص گیاهان دارویی که بیشتر از همه اشتباه مصرف می‌شوند',
    excerpt: 'گاوزبان زیاد فشار را می‌اندازد و سنا را نباید هر شب خورد. راهنمای مقدار درست.',
    minutes: 7,
    tag: 'گیاه‌شناسی',
    date: '2026-05-18',
    image: '/images/products/gol-gavzaban.jpg',
    body: [
      'پرتکرارترین اشتباهی که در دکان می‌بینیم این است که مردم گیاه دارویی را «بی‌ضرر» فرض می‌کنند و مقدارش را دو برابر می‌کنند. گل گاوزبان نمونه‌ی روشن آن است: یک فنجان در روز آرام‌بخش است، سه فنجان فشار خون را تا جایی می‌اندازد که سرگیجه بیاورد.',
      'سنا و ریشه‌ی شیرین‌بیان دسته‌ی دوم‌اند: مصرف کوتاه‌مدت‌شان کار می‌کند، مصرف هر شب باعث وابستگی روده و افت پتاسیم می‌شود. قاعده‌ی ما این است که این دو را بیشتر از پنج شب پشت سر هم پیشنهاد نمی‌کنیم.',
      'دسته‌ی سوم گیاهانی هستند که با دارو تعارض دارند. اگر وارفارین، داروی تیروئید یا داروی فشار مصرف می‌کنید، پیش از افزودن هر دمنوش تازه به روزتان با پزشک‌تان حرف بزنید. ما دارو نمی‌فروشیم و جای پزشک را نمی‌گیریم.',
      'اندازه‌گیری هم مهم است: «یک قاشق» در خانه‌ها بین دو تا پنج گرم فرق دارد. اگر ترازوی آشپزخانه دارید، برای دمنوش‌های قوی از آن استفاده کنید.',
    ],
  },
  {
    slug: 'rahnamaye-damnoosh',
    title: 'راهنمای انتخاب دمنوش بر اساس ساعت روز',
    excerpt: 'صبح چای سبز، عصر بابونه، شب گاوزبان. چرا ترتیب مهم است؟',
    minutes: 5,
    tag: 'دمنوش',
    date: '2026-04-02',
    image: '/images/products/babouneh.jpg',
    body: [
      'بدن در ساعت‌های مختلف روز به گیاه یکسان واکنش یکسان نمی‌دهد. چای سبز و چای ترش صبح‌ها بهترین‌اند چون کافئین و اسیدهای میوه‌ای‌شان هوشیاری را بالا می‌برد بدون آنکه مثل قهوه افت شدید بعدی داشته باشد.',
      'بعد از ناهار، دمنوش‌های گوارشی جواب می‌دهند: نعنا خشک، زنجبیل و لیمو، و دارچین سیلان. اینها حرکت معده را کمک می‌کنند و سنگینی بعد از غذا را کم می‌کنند.',
      'عصر نوبت بابونه است. اثرش ملایم است و برخلاف تصور عمومی، خواب‌آور قوی نیست؛ آرام‌کننده‌ی عصبی است. اگر دنبال خواب بهتر هستید، بابونه را دو ساعت پیش از خواب بخورید نه دقیقاً موقع خواب.',
      'شب، گل گاوزبان و اسطوخودوس. یک فنجان کافی است. ترکیب «آرامش شب» ما همین دو به‌علاوه‌ی کمی سنبل‌الطیب است.',
    ],
  },
  {
    slug: 'entekhab-advieh',
    title: 'چگونه ادویه اصل را از تقلبی تشخیص دهیم؟',
    excerpt: 'زردچوبه آردی، زعفران رنگ‌شده و دارچین کاسیا: سه آزمایش ساده خانگی.',
    minutes: 6,
    tag: 'ادویه',
    date: '2026-02-25',
    image: '/images/products/darchin-seylan.jpg',
    body: [
      'زعفران: چند رشته را در آب سرد بیندازید. زعفران اصل رنگ را آرام و در چند دقیقه پس می‌دهد و خود رشته رنگ قرمزش را نگه می‌دارد. زعفران رنگ‌شده آب را فوری قرمز می‌کند و رشته سفید می‌شود.',
      'دارچین: سیلان (اصل) لایه‌لایه، نازک و شکننده است و عطر شیرین ملایمی دارد. کاسیا ضخیم، سخت و تندتر است. اگر با فشار انگشت خرد شد، سیلان است.',
      'زردچوبه: یک قاشق را در یک لیوان آب گرم هم بزنید. زردچوبه‌ی خالص آب را زرد کدر می‌کند و رسوبش نرم است. اگر آرد یا خاک اضافه شده باشد، ته لیوان لایه‌ی سنگین و دانه‌دار می‌بینید.',
      'قاعده‌ی کلی: ادویه‌ی آسیاب‌شده‌ی ارزان همیشه مشکوک است. آسیاب کردن جای پنهان کردن است. ما ادویه را درسته می‌فروشیم و در محل آسیاب می‌کنیم.',
    ],
  },
  {
    slug: 'negahdari-giah',
    title: 'گیاه خشک را چطور نگه داریم که یک سال عطرش نرود؟',
    excerpt: 'شیشه‌ی تیره، دور از گاز، و چیزی که هیچ‌کس رعایت نمی‌کند: رطوبت.',
    minutes: 4,
    tag: 'نگهداری',
    date: '2026-01-11',
    image: '/images/products/nanaa-khoshk.jpg',
    body: [
      'سه دشمن گیاه خشک: نور، گرما، رطوبت. ترتیب اهمیت هم همین است. شیشه‌ی تیره یا حلب دربسته بهترین ظرف است؛ کیسه‌ی پلاستیکی بدترین، چون رطوبت را نگه می‌دارد و بو را رد می‌کند.',
      'جای اشتباه رایج: قفسه‌ی بالای گاز. بخار و گرمای پخت‌وپز سریع‌ترین راه از دست دادن روغن‌های فرار گیاه است. کابینت خنک و دور از پنجره انتخاب درست است.',
      'برگ‌ها (نعنا، بادرنجبویه) حدود یک سال عطر دارند، گل‌ها (بابونه، گاوزبان) شش تا نه ماه، و ریشه‌ها و پوست‌ها (زنجبیل، دارچین) دو سال. اگر بو نمی‌دهد، خاصیتش هم رفته.',
      'گیاه را پیش از مصرف بین دو انگشت بمالید و بو کنید. این ساده‌ترین تست تازگی است و از هر تاریخ روی بسته صادق‌تر.',
    ],
  },
  {
    slug: 'aragiat-tagtir',
    title: 'عرقیات: تفاوت تقطیر سنتی و صنعتی روی مزه',
    excerpt: 'چرا عرق نعنای مسی مزه‌ی دیگری دارد و چرا کف کردن نشانه‌ی خوبی نیست.',
    minutes: 8,
    tag: 'عرقیات',
    date: '2025-11-30',
    image: '/images/products/chai-torsh.jpg',
    body: [
      'تقطیر سنتی در دیگ مسی با آتش ملایم و در چند ساعت انجام می‌شود. حرارت پایین یعنی ترکیب‌های معطر فرصت دارند بدون سوختن جدا شوند. نتیجه عرقی است با مزه‌ی گرد و بدون تلخی انتهایی.',
      'تقطیر صنعتی با بخار پرفشار سریع‌تر و ارزان‌تر است، ولی بخشی از ترکیب‌های ظریف را می‌سوزاند. مزه‌اش تیزتر و یک‌بعدی‌تر است. برای مصارف آشپزی فرقی ندارد، برای نوشیدن فرق دارد.',
      'نشانه‌های عرق سالم: شفافیت کامل، بوی گیاه نه بوی الکل، و ماندن مزه در دهان. کف کردن زیاد هنگام تکان دادن معمولاً نشانه‌ی افزودن مواد نگهدارنده است، نه کیفیت.',
      'عرقیات را در جای خنک و تاریک نگه دارید. بعد از باز شدن، در یخچال تا سه ماه سالم می‌ماند. اگر بو یا رنگ عوض شد، دور بریزید.',
    ],
  },
  {
    slug: 'roghan-press-sard',
    title: 'روغن پرس سرد را با چه معیاری بخریم؟',
    excerpt: 'رنگ تیره همیشه خوب نیست و «پرس سرد» روی برچسب تضمین نیست.',
    minutes: 6,
    tag: 'روغن',
    date: '2025-10-14',
    image: '/images/products/avishan-shirazi.jpg',
    body: [
      'پرس سرد یعنی دانه بدون حرارت افزوده فشرده شده و دمای فرآیند زیر حدود ۵۰ درجه مانده. این کار بازده را پایین می‌آورد، پس روغن پرس سرد واقعی گران‌تر است. قیمت پایین با برچسب «پرس سرد» علامت خطر است.',
      'رنگ معیار خوبی نیست. روغن کنجد پرس سرد روشن‌تر از کنجد بوداده است، در حالی که خیلی‌ها تیرگی را نشانه‌ی اصالت می‌دانند. بو معیار بهتری است: باید بوی خود دانه را بدهد.',
      'بسته‌بندی مهم است: شیشه‌ی تیره یا حلب. روغن در بطری شفاف روی قفسه‌ی مغازه در معرض نور، در چند هفته اکسید می‌شود.',
      'تاریخ استخراج را بپرسید، نه فقط تاریخ انقضا. روغن پرس سرد شش تا نه ماه پس از استخراج در بهترین حالت است.',
    ],
  },
];

const TAGS = ['همه', ...Array.from(new Set(ARTICLES.map((a) => a.tag)))];

/** کارت مقاله با ظاهر شدن تدریجی هنگام ورود به دید. */
function ArticleCard({ article, featured = false }) {
  const [ref, visible] = useReveal();

  return (
    <article
      ref={ref}
      className={`group transition-[opacity,transform] duration-700 ease-expo ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
      } ${featured ? 'md:col-span-2 md:grid md:grid-cols-2 md:items-center md:gap-8' : ''}`}
    >
      <Link to={`/journal/${article.slug}`} className="block overflow-hidden rounded-2xl bg-bone-100">
        <SmartImage
          src={article.image}
          alt=""
          loading="lazy"
          decoding="async"
          width="900" height="560"
          sizes={featured ? '(max-width: 768px) 92vw, 46vw' : '(max-width: 768px) 92vw, 30vw'}
          className={`w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-105 ${featured ? 'aspect-[16/11]' : 'aspect-[16/10]'}`}
          fallbackLabel=""
        />
      </Link>

      <div className={featured ? 'mt-5 md:mt-0' : 'mt-4'}>
        <div className="flex items-center gap-2 text-2xs text-ink-400">
          <span className="font-semibold text-moss-600">{article.tag}</span>
          <span>·</span>
          <span className="num flex items-center gap-1"><FiClock size={11} />{toFa(article.minutes)} دقیقه</span>
          <span>·</span>
          <span className="num">{faDate(article.date)}</span>
        </div>
        <h3 className={`mt-2 font-bold leading-7 ${featured ? 'text-xl sm:text-2xl' : 'text-[1.05rem]'}`}>
          <Link to={`/journal/${article.slug}`} className="hover:text-moss-700">{article.title}</Link>
        </h3>
        <p className={`mt-2 leading-7 text-ink-500 ${featured ? 'text-[0.95rem]' : 'text-sm'}`}>{article.excerpt}</p>
        <Link
          to={`/journal/${article.slug}`}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-moss-700 transition-colors hover:text-moss-900"
        >
          خواندن مقاله
          <FiArrowLeft size={15} className="transition-transform duration-200 group-hover:-translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

/** نمای یک مقاله. */
function ArticleView({ article }) {
  const index = ARTICLES.findIndex((a) => a.slug === article.slug);
  const next = ARTICLES[(index + 1) % ARTICLES.length];

  return (
    <>
      <Seo
        title={article.title}
        description={article.excerpt}
        image={article.image}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.excerpt,
          datePublished: article.date,
          articleSection: article.tag,
          publisher: { '@type': 'Organization', name: 'کالاوران' },
        }}
      />

      <div className="border-b hairline bg-bone-100">
        <div className="wrap max-w-[74ch] py-10 sm:py-14">
          <nav className="mb-4 flex min-w-0 items-center gap-2 overflow-hidden text-2xs text-ink-400" aria-label="مسیر">
            <Link to="/" className="hover:text-moss-700">خانه</Link>
            <span>/</span>
            <Link to="/journal" className="hover:text-moss-700">مجله گیاهان</Link>
            <span>/</span>
            <span className="truncate text-ink-700">{article.tag}</span>
          </nav>

          <h1 className="text-[clamp(1.6rem,4.5vw,2.5rem)] font-extrabold leading-tight tracking-tight">
            {article.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-ink-400">
            <span className="chip bg-moss-100 text-moss-900">{article.tag}</span>
            <span className="num flex items-center gap-1.5"><FiClock size={13} />{toFa(article.minutes)} دقیقه مطالعه</span>
            <span className="num">{faDate(article.date)}</span>
          </div>
        </div>
      </div>

      <div className="wrap max-w-[74ch] py-10">
        <SmartImage
          src={article.image}
          alt=""
          width="900" height="500"
          sizes="(max-width: 1024px) 92vw, 74ch"
          className="aspect-[16/9] w-full rounded-2xl object-cover"
          fallbackLabel=""
        />

        <div className="mt-9">
          <p className="border-r-2 border-moss-300 pr-5 text-lg font-medium leading-9 text-ink-700">
            {article.excerpt}
          </p>
          {article.body.map((p, i) => (
            <p key={i} className="mt-6 text-[0.98rem] leading-9 text-ink-700">{p}</p>
          ))}
        </div>

        <p className="mt-10 rounded-2xl bg-saffron-50 p-5 text-sm leading-7 text-ink-700">
          این نوشته تجربه‌ی عطاری است، نه توصیه‌ی پزشکی. برای شرایط خاص، بارداری یا
          مصرف همزمان دارو، با پزشک مشورت کنید.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t hairline pt-7">
          <Link to="/journal" className="btn-outline btn-sm gap-2">
            <FiArrowRight size={15} /> همه‌ی مقاله‌ها
          </Link>
          <Link to={`/journal/${next.slug}`} className="group max-w-[26rem] text-left">
            <span className="block text-2xs text-ink-400">مقاله‌ی بعدی</span>
            <span className="mt-0.5 flex items-center gap-2 text-sm font-semibold text-moss-700 group-hover:text-moss-900">
              {next.title}
              <FiArrowLeft size={15} className="shrink-0 transition-transform duration-200 group-hover:-translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}

export default function Journal() {
  const { slug } = useParams();
  const [tag, setTag] = useState('همه');

  const article = slug ? ARTICLES.find((a) => a.slug === slug) : null;

  const filtered = useMemo(
    () => (tag === 'همه' ? ARTICLES : ARTICLES.filter((a) => a.tag === tag)),
    [tag],
  );

  if (slug && !article) {
    return (
      <div className="wrap py-20">
        <EmptyState
          icon={FiSearch}
          title="این مقاله پیدا نشد"
          description="ممکن است نشانی عوض شده باشد. از فهرست مقاله‌ها شروع کنید."
          action="همه‌ی مقاله‌ها"
          to="/journal"
        />
      </div>
    );
  }

  if (article) return <ArticleView article={article} />;

  return (
    <>
      <Seo
        title="مجله گیاهان"
        description="نوشته‌های کوتاه درباره‌ی مصرف درست گیاهان دارویی، تشخیص ادویه‌ی اصل، نگهداری و عرقیات."
      />

      <div className="border-b hairline bg-bone-100">
        <div className="wrap py-12 sm:py-16">
          <p className="text-2xs font-bold uppercase tracking-[0.14em] text-moss-600">مجله گیاهان</p>
          <h1 className="mt-3 text-[clamp(1.7rem,4.5vw,2.6rem)] font-extrabold tracking-tight">
            پیش از خرید، کمی بدانید
          </h1>
          <p className="mt-4 max-w-[56ch] text-base leading-8 text-ink-500">
            چهل سال تجربه‌ی دکان، بدون ادعای درمان. هر نوشته کوتاه است و به یک
            پرسش عملی جواب می‌دهد.
          </p>
        </div>
      </div>

      <div className="wrap py-10">
        {/* فیلتر موضوعی، بدون رفت‌وبرگشت به سرور */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="موضوع مقاله‌ها">
          {TAGS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tag === t}
              onClick={() => setTag(t)}
              className={`h-9 rounded-xl px-3.5 text-sm font-medium transition-colors ${
                tag === t ? 'bg-moss-700 text-bone-50' : 'bg-bone-100 text-ink-500 hover:bg-moss-50 hover:text-moss-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-9 grid gap-9 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a, i) => (
            <ArticleCard key={a.slug} article={a} featured={tag === 'همه' && i === 0} />
          ))}
        </div>
      </div>
    </>
  );
}
