import { useCallback, useEffect, useRef, useState } from 'react';

export function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** الگوی واحد fetch: loading / error / data و جلوگیری از setState بعد از unmount. */
export function useFetch(fetcher, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({ data: null, loading: immediate, error: null });
  const alive = useRef(true);

  const load = useCallback(async (...args) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await fetcher(...args);
      if (alive.current) setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      if (alive.current) setState({ data: null, loading: false, error: err.message || 'خطا' });
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    alive.current = true;
    if (immediate) load();
    return () => { alive.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  return { ...state, reload: load, setData: (data) => setState((s) => ({ ...s, data })) };
}

/** جلوگیری از دوبار submit شدن فرم. */
export function useSubmit(handler) {
  const [submitting, setSubmitting] = useState(false);
  const lock = useRef(false);
  const submit = useCallback(async (...args) => {
    if (lock.current) return undefined;
    lock.current = true;
    setSubmitting(true);
    try {
      return await handler(...args);
    } finally {
      lock.current = false;
      setSubmitting(false);
    }
  }, [handler]);
  return [submit, submitting];
}

export function useLockBody(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
}

/**
 * جهت اسکرول + عبور از آستانه. مبنای هدرِ «با اسکرول پایین پنهان شو،
 * با اسکرول بالا برگرد» است. با requestAnimationFrame throttle می‌شود
 * تا روی هر پیکسل اسکرول، رندر پشت سر هم نداشته باشیم.
 */
export function useScrollDirection({ threshold = 64 } = {}) {
  const [state, setState] = useState({ direction: 'up', scrolled: false, atTop: true });
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const update = () => {
      const y = window.scrollY;
      const diff = y - lastY.current;

      // نویز چند پیکسلی و کشش لاستیکی موبایل را نادیده بگیر
      if (Math.abs(diff) > 6) {
        setState({
          direction: diff > 0 && y > threshold ? 'down' : 'up',
          scrolled: y > 12,
          atTop: y < 8,
        });
        lastY.current = y;
      } else if (y < 8) {
        setState((s) => (s.atTop ? s : { ...s, atTop: true, scrolled: false }));
      }
      ticking.current = false;
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return state;
}

/**
 * ظاهر شدن تدریجی هنگام ورود به دید، با IntersectionObserver.
 * جایگزین انیمیشن‌هایی که قبلاً بدون شرط روی mount اجرا می‌شدند و
 * برای محتوای پایین صفحه بی‌فایده بودند.
 */
export function useReveal({ threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    // احترام به تنظیم کاربر: بدون انیمیشن، مستقیم نمایش بده
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return undefined;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        if (once) io.disconnect();
      } else if (!once) setVisible(false);
    }, { threshold, rootMargin });

    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, visible];
}

/** آیا المان در دید هست؛ برای متوقف کردن تایمر/انیمیشن بیرون از دید. */
export function useInView({ rootMargin = '120px' } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return [ref, inView];
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** بستن با کلیک بیرون + کلید Escape، در یک هوک. */
export function useDismiss(open, onDismiss) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onPointer = (e) => { if (!ref.current?.contains(e.target)) onDismiss?.(); };
    const onKey = (e) => { if (e.key === 'Escape') onDismiss?.(); };

    // pointerdown زودتر از click است و با لمس هم درست کار می‌کند
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onDismiss]);

  return ref;
}

/** میان‌بر کیبورد، مثل Ctrl+K برای جست‌وجو. */
export function useHotkey(combo, handler) {
  useEffect(() => {
    const onKey = (e) => {
      const target = e.target;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName) || target?.isContentEditable;

      const wantsMod = combo.includes('mod+');
      const key = combo.replace('mod+', '');
      const modOk = wantsMod ? (e.metaKey || e.ctrlKey) : !e.metaKey && !e.ctrlKey && !e.altKey;

      if (!wantsMod && typing) return; // میان‌بر بدون mod نباید تایپ را بدزدد
      if (modOk && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        handler(e);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [combo, handler]);
}

/**
 * مقدار را بین رندرها در sessionStorage نگه می‌دارد.
 * برای کش دسته‌بندی‌ها استفاده می‌شود تا هر بار mount شدن layout
 * یک درخواست شبکه‌ی تکراری نزند.
 */
export function useSessionState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch { return initial; }
  });

  const save = useCallback((next) => {
    setValue(next);
    try { sessionStorage.setItem(key, JSON.stringify(next)); } catch { /* حافظه پر یا حالت خصوصی */ }
  }, [key]);

  return [value, save];
}
