# راه‌اندازی

`node_modules` از این آرشیو حذف شده است. نسخه‌ای که در فایل اصلی بود ناقص
استخراج شده بود (مثلاً `express` فقط ۱۶ فایل داشت و `append-field/package.json`
صفر بایت بود)، پس در هر صورت باید دوباره نصب شود:

```bash
# ۱. بک‌اند
cd backend
npm install
cp .env.example .env     # اگر .env ندارید؛ کلیدها را پر کنید
npm run seed
npm run dev              # http://localhost:5000

# ۲. فرانت‌اند (ترمینال دوم)
cd frontend
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```

MongoDB باید در حال اجرا باشد.

نکته: `VITE_API_URL` حالا پیش‌فرض `/api` است و از proxy ویت استفاده می‌کند،
پس در توسعه همه‌چیز same-origin است. اگر می‌خواهید مستقیم به بک‌اند وصل شوید،
مقدار آن را `http://localhost:5000/api` بگذارید.

شرح کامل تغییرات در انتهای `README.md` آمده است.
