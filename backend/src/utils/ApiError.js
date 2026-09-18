class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
  static badRequest(m = 'درخواست نامعتبر است', d) { return new ApiError(400, m, d); }
  static unauthorized(m = 'ابتدا وارد حساب خود شوید') { return new ApiError(401, m); }
  static forbidden(m = 'شما به این بخش دسترسی ندارید') { return new ApiError(403, m); }
  static notFound(m = 'موردی پیدا نشد') { return new ApiError(404, m); }
  static conflict(m = 'این مورد از قبل وجود دارد') { return new ApiError(409, m); }
  static tooMany(m = 'تعداد درخواست‌ها زیاد است، بعداً تلاش کنید') { return new ApiError(429, m); }
}

// هم named و هم default صادر می‌شود: ۹ فایل پروژه `{ ApiError }` را import
// می‌کردند در حالی که این ماژول فقط default داشت و مقدار undefined می‌گرفتند.
export { ApiError };
export default ApiError;
