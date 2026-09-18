import { z } from 'zod';

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'شناسه معتبر نیست');
export const idParam = z.object({ id: objectId });
export const persianPhone = z.string().regex(/^09\d{9}$/, 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد');
export const password = z
  .string()
  .min(8, 'رمز عبور حداقل ۸ کاراکتر باشد')
  .regex(/[a-zA-Zآ-ی]/, 'رمز عبور باید حداقل یک حرف داشته باشد')
  .regex(/\d/, 'رمز عبور باید حداقل یک رقم داشته باشد');
export const numeric = (msg = 'مقدار عددی معتبر نیست') => z.coerce.number({ invalid_type_error: msg });
export const boolish = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .transform((v) => v === true || v === 'true' || v === '1');
