import slugify from 'slugify';

/** slugify استاندارد برای متن فارسی: کاراکترهای فارسی حفظ می‌شوند تا URL معنادار بماند. */
export const toSlug = (value) =>
  slugify(String(value), { lower: true, strict: true, locale: 'fa', remove: /[*+~.()'"!:@؟،]/g });

export const uniqueSlug = async (Model, value, ignoreId = null) => {
  const base = toSlug(value) || Date.now().toString(36);
  let slug = base;
  let i = 1;
  while (await Model.exists({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) slug = `${base}-${++i}`;
  return slug;
};
