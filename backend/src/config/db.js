import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

export async function connectDB() {
  const conn = await mongoose.connect(env.mongoUri, {
    // autoIndex در پرودکشن هزینه‌ی راه‌اندازی و قفل دارد؛ ایندکس‌ها را
    // با اسکریپت مهاجرت می‌سازیم نه در هر بوت.
    autoIndex: !env.isProd,

    // استخر اتصال: پیش‌فرض درایور برای یک API با ترافیک واقعی کم است و
    // زیر بار، کوئری‌ها در صف انتظار اتصال می‌مانند.
    maxPoolSize: env.isProd ? 25 : 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,

    // شکست سریع بهتر از هنگ کردن درخواست تا بی‌نهایت است
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,

    // خواندن‌های سنگین داشبورد را می‌توان به سکندری سپرد
    readPreference: 'primaryPreferred',
    compressors: ['zlib'],
  });

  console.log(`[db] MongoDB متصل شد: ${conn.connection.host}/${conn.connection.name}`);

  mongoose.connection.on('disconnected', () => console.warn('[db] اتصال قطع شد، درایور خودش تلاش مجدد می‌کند'));
  mongoose.connection.on('error', (err) => console.error('[db] خطای اتصال', err.message));

  // کوئری کند را در توسعه لو می‌دهد تا ایندکس فراموش‌شده پیدا شود
  if (!env.isProd) {
    mongoose.set('debug', (collection, method, query) => {
      const started = Date.now();
      process.nextTick(() => {
        const ms = Date.now() - started;
        if (ms > 120) console.warn(`[db][slow ${ms}ms] ${collection}.${method}`, JSON.stringify(query).slice(0, 160));
      });
    });
  }

  return conn;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
