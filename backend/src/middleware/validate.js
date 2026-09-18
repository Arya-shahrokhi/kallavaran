import { ApiError } from '../utils/ApiError.js';

/** اعتبارسنجی body/params/query با Zod و جایگذاری داده parse‌شده (whitelist خودکار). */
export const validate = (schemas) => (req, _res, next) => {
  for (const key of ['body', 'params', 'query']) {
    const schema = schemas[key];
    if (!schema) continue;
    const result = schema.safeParse(req[key]);
    if (!result.success) {
      const details = result.error.issues.reduce((acc, issue) => {
        acc[issue.path.join('.') || key] = issue.message;
        return acc;
      }, {});
      return next(ApiError.badRequest('اطلاعات ارسالی معتبر نیست', details));
    }
    req[key] = result.data;
  }
  return next();
};
