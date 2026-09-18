/** پالت با OKLCH: سبز زیتونی عمیق + لهجه زعفرانی + خنثی‌های متمایل به سبز. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Vazirmatn', 'system-ui', 'sans-serif'] },
      colors: {
        ink: {
          900: 'oklch(21% 0.018 152)',
          700: 'oklch(34% 0.02 152)',
          500: 'oklch(48% 0.015 152)',
          400: 'oklch(58% 0.012 152)',
          300: 'oklch(72% 0.01 152)',
        },
        moss: {
          900: 'oklch(28% 0.055 150)',
          700: 'oklch(38% 0.075 150)',
          600: 'oklch(46% 0.088 149)',
          500: 'oklch(54% 0.095 148)',
          300: 'oklch(76% 0.055 146)',
          100: 'oklch(93% 0.028 145)',
          50: 'oklch(96.5% 0.016 145)',
        },
        saffron: {
          600: 'oklch(60% 0.135 58)',
          500: 'oklch(68% 0.145 62)',
          200: 'oklch(90% 0.055 72)',
          50: 'oklch(96% 0.025 76)',
        },
        bone: {
          50: 'oklch(98.6% 0.005 100)',
          100: 'oklch(96.5% 0.009 96)',
          200: 'oklch(93% 0.012 94)',
          300: 'oklch(88% 0.014 92)',
        },
        berry: { 600: 'oklch(52% 0.14 20)', 100: 'oklch(94% 0.03 22)' },
      },
      fontSize: {
        '2xs': ['0.7rem', { lineHeight: '1.1rem' }],
      },
      boxShadow: {
        card: '0 1px 2px oklch(21% 0.018 152 / 0.04), 0 8px 24px -16px oklch(21% 0.018 152 / 0.18)',
        lift: '0 2px 6px oklch(21% 0.018 152 / 0.06), 0 18px 40px -20px oklch(21% 0.018 152 / 0.28)',
        pop: '0 24px 60px -24px oklch(21% 0.018 152 / 0.35)',
      },
      transitionTimingFunction: {
        quart: 'cubic-bezier(0.25, 1, 0.5, 1)',
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-up': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'none' } },
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-in': { from: { transform: 'translateX(-100%)' }, to: { transform: 'none' } },
        // کشوی سبد از سمت چپ (چیدمان RTL) می‌آید
        'slide-in-left': { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        'pop-in': { from: { opacity: 0, transform: 'scale(0.94)' }, to: { opacity: 1, transform: 'none' } },
        shimmer: { '100%': { transform: 'translateX(-100%)' } },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.3s ease-out both',
        'slide-in': 'slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-left': 'slide-in-left 0.32s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pop-in': 'pop-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
