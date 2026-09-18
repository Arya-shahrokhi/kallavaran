/** حذف try/catch تکراری از کنترلرها. */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
