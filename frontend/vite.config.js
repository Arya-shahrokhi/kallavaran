import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * این فایل خالی بود، یعنی پروژه با تنظیمات پیش‌فرض ویت build می‌شد:
 * بدون تقسیم چانک، بدون proxy، و همه‌ی کد (پنل مدیریت، Swiper، نمودارها)
 * در یک باندل که کاربر صفحه‌ی اول هم مجبور بود دانلود کند.
 */
export default defineConfig(({ mode }) => ({
  plugins: [react()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,
    // proxy یعنی در توسعه هم origin یکی است: بدون preflight اضافه و
    // بدون دردسر cookie در حالت cross-site
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },

  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: mode !== 'production',
    // ترمینیتور پیش‌فرض esbuild است؛ سریع و برای این حجم کافی
    minify: 'esbuild',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 600,
    assetsInlineLimit: 4096,

    rollupOptions: {
      output: {
        /**
         * تقسیم دستی وابستگی‌ها: هدف این است که کاربر صفحه‌ی خانه،
         * کد Swiper و پنل مدیریت را دانلود نکند و کش مرورگر با هر
         * تغییر کوچک اپ باطل نشود.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-router')) return 'router';
          if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('scheduler')) return 'react';
          if (id.includes('swiper') || id.includes('ssr-window') || id.includes('dom7')) return 'carousel';
          if (id.includes('axios')) return 'http';
          if (id.includes('react-icons')) return 'icons';
          return 'vendor';
        },

        // نام‌گذاری تمیز با hash: کش طولانی‌مدت روی assets امن می‌شود
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },

  // وابستگی‌های سنگین یک‌بار پیش‌باندل می‌شوند تا dev server کند نشود
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },

  esbuild: {
    // console و debugger در باندل پرودکشن جایی ندارند
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none',
  },
}));
