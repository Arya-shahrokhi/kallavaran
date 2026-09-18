import axios from 'axios';

// پیش‌فرض نسبی است تا proxy ویت کار کند (same-origin، بدون preflight).
// برای تماس مستقیم با بک‌اند، VITE_API_URL را در .env ست کنید.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

let accessToken = null;
let onUnauthorized = () => {};

export const setAccessToken = (token) => { accessToken = token; };
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

/** شناسه مهمان برای سبد خرید قبل از ورود؛ خود سبد سمت سرور است. */
export const guestId = (() => {
  const key = 'attari_guest_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = (crypto.randomUUID?.() || `g-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(key, id);
  }
  return id;
})();

export const api = axios.create({ baseURL: BASE_URL, withCredentials: true, timeout: 20000 });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  config.headers['X-Guest-Id'] = guestId;
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const { response, config } = error;

    // تلاش یک‌باره برای تازه‌سازی توکن
    if (response?.status === 401 && !config._retried && !config.url.includes('/auth/')) {
      config._retried = true;
      try {
        refreshing = refreshing || api.post('/auth/refresh');
        const data = await refreshing;
        refreshing = null;
        setAccessToken(data.data.accessToken);
        return api(config);
      } catch {
        refreshing = null;
        onUnauthorized();
      }
    }

    const payload = response?.data;
    return Promise.reject({
      status: response?.status || 0,
      message: payload?.message || (error.code === 'ECONNABORTED'
        ? 'زمان درخواست به پایان رسید، اتصال خود را بررسی کنید'
        : 'ارتباط با سرور برقرار نشد'),
      details: payload?.error?.details || null,
    });
  },
);
