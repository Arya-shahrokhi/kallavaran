export const ok = (res, data = {}, message = 'عملیات با موفقیت انجام شد', status = 200) =>
  res.status(status).json({ success: true, message, data });

export const created = (res, data = {}, message = 'با موفقیت ایجاد شد') => ok(res, data, message, 201);

export const fail = (res, status, message, error = {}) =>
  res.status(status).json({ success: false, message, error });
