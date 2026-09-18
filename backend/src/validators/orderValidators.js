import { z } from 'zod';
import { ORDER_STATUS } from '../models/Order.js';
import { objectId, persianPhone } from './common.js';

export const createOrderSchema = {
  body: z.object({
    addressId: objectId.optional(),
    shippingAddress: z.object({
      receiver: z.string().trim().min(3, 'نام گیرنده الزامی است'),
      phone: persianPhone,
      province: z.string().trim().min(2, 'استان الزامی است'),
      city: z.string().trim().min(2, 'شهر الزامی است'),
      postalCode: z.string().regex(/^\d{10}$/, 'کد پستی باید ۱۰ رقم باشد'),
      line: z.string().trim().min(10, 'آدرس کامل الزامی است'),
      note: z.string().trim().max(400).optional(),
    }).optional(),
    paymentMethod: z.enum(['COD', 'GATEWAY']).optional(),
  }).strict().refine((v) => v.addressId || v.shippingAddress, {
    message: 'یک آدرس انتخاب یا ثبت کنید',
    path: ['shippingAddress'],
  }),
};

export const updateOrderStatusSchema = {
  body: z.object({ orderStatus: z.enum(Object.values(ORDER_STATUS)) }).strict(),
};
