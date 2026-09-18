import { useEffect } from 'react';

const upsert = (selector, attrs) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(attrs.tag);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => { if (k !== 'tag') el.setAttribute(k, v); });
  return el;
};

/** SEO سبک و بدون کتابخانه: title، description، Open Graph و JSON-LD. */
export default function Seo({ title, description, image, jsonLd, canonical }) {
  /**
   * jsonLd در محل استفاده به‌صورت آبجکت inline نوشته می‌شود، پس در هر رندر
   * یک مرجع تازه است. قبلاً همین باعث می‌شد این useEffect در *هر* رندر
   * اجرا شود و تگ <script> را از head حذف و دوباره اضافه کند.
   * با سریال‌سازی، وابستگی به «محتوا» بسته می‌شود نه به «مرجع».
   */
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const full = title ? `${title} | کالاوران` : 'کالاوران | فروشگاه محصولات گیاهی و طبیعی';
    document.title = full;

    if (description) {
      upsert('meta[name="description"]', { tag: 'meta', name: 'description', content: description });
      upsert('meta[property="og:description"]', { tag: 'meta', property: 'og:description', content: description });
    }
    upsert('meta[property="og:title"]', { tag: 'meta', property: 'og:title', content: full });
    if (image) upsert('meta[property="og:image"]', { tag: 'meta', property: 'og:image', content: image });
    upsert('link[rel="canonical"]', { tag: 'link', rel: 'canonical', href: canonical || window.location.href });

    let script;
    if (jsonLdKey) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = jsonLdKey;
      document.head.appendChild(script);
    }
    return () => { if (script) script.remove(); };
  }, [title, description, image, jsonLdKey, canonical]);

  return null;
}
