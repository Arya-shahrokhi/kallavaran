import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import { productApi } from '../../services/endpoints.js';
import { useDebounced } from '../../hooks/index.js';
import { finalPrice, toman } from '../../utils/format.js';
import Spinner from '../ui/Spinner.jsx';
import SmartImage from '../ui/SmartImage.jsx';

export default function SearchBar({ autoFocus = false, onNavigate }) {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounced(term, 350);
  const box = useRef(null);

  useEffect(() => {
    if (debounced.trim().length < 2) { setResults(null); return; }
    let alive = true;
    setLoading(true);
    productApi.list({ search: debounced.trim(), limit: 5 })
      .then(({ data }) => { if (alive) setResults(data.products); })
      .catch(() => { if (alive) setResults([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [debounced]);

  useEffect(() => {
    const onClick = (e) => { if (!box.current?.contains(e.target)) setResults(null); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const go = (path) => { setResults(null); setTerm(''); onNavigate?.(); navigate(path); };

  const submit = (e) => {
    e.preventDefault();
    if (term.trim()) go(`/products?search=${encodeURIComponent(term.trim())}`);
  };

  return (
    <div ref={box} className="relative w-full">
      <form onSubmit={submit} role="search">
        <FiSearch className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
        <input
          type="search"
          value={term}
          autoFocus={autoFocus}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="گل گاوزبان، زعفران، دمنوش…"
          aria-label="جست‌وجوی محصولات"
          className="h-11 w-full rounded-xl border border-transparent bg-bone-100 pr-11 pl-10 text-sm transition-colors placeholder:text-ink-300 focus:border-moss-300 focus:bg-bone-50 focus:outline-none focus:ring-2 focus:ring-moss-100"
        />
        {(loading || term) && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
            {loading ? <Spinner size={16} /> : (
              <button type="button" onClick={() => { setTerm(''); setResults(null); }} aria-label="پاک کردن"><FiX size={16} /></button>
            )}
          </span>
        )}
      </form>

      {results && (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border hairline bg-bone-50 shadow-pop animate-fade-in">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ink-400">چیزی پیدا نشد. املای عبارت را بررسی کنید.</p>
          ) : (
            <>
              <ul className="divide-y hairline">
                {results.map((p) => (
                  <li key={p._id}>
                    <button onClick={() => go(`/products/${p.slug}`)} className="flex w-full items-center gap-3 px-3 py-2.5 text-right transition-colors hover:bg-moss-50">
                      <SmartImage src={p.images?.[0]?.url} alt="" loading="lazy" className="size-11 rounded-lg object-cover" fallbackLabel="" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{p.name}</span>
                        <span className="num block text-xs text-ink-400">{toman(finalPrice(p))}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button onClick={() => go(`/products?search=${encodeURIComponent(term.trim())}`)} className="w-full bg-bone-100 px-4 py-3 text-xs font-medium text-moss-700 hover:bg-moss-50">
                مشاهده همه نتایج
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
