/**
 * لایه انتزاعی پرداخت. الان COD است؛ افزودن درگاه ایرانی (زرین‌پال، آیدی‌پی، ...)
 * فقط پیاده‌سازی همین دو متد در یک adapter جدید است، بدون تغییر در controller.
 */
export const codProvider = {
  name: 'COD',
  async createPayment(order) {
    return { redirectUrl: null, authority: null, order };
  },
  async verifyPayment() {
    return { paid: false, refId: null };
  },
};

import ApiError from '../utils/ApiError.js';

export const getPaymentProvider = (method) => {
  if (method === 'COD') return codProvider;
  // Do not silently turn an unsupported online payment into cash-on-delivery.
  if (method === 'GATEWAY') throw ApiError.badRequest('پرداخت اینترنتی هنوز فعال نیست');
  throw ApiError.badRequest('روش پرداخت نامعتبر است');
};
