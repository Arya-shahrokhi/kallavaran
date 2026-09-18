import { z } from 'zod';
import { boolish, numeric, objectId } from './common.js';

const base = {
  name: z.string().trim().min(3, 'نام محصول حداقل ۳ کاراکتر باشد').max(140),
  description: z.string().trim().min(20, 'توضیحات حداقل ۲۰ کاراکتر باشد').max(4000),
  shortDescription: z.string().trim().max(240).optional(),
  category: objectId,
  price: numeric('قیمت معتبر نیست').min(0),
  discount: numeric().min(0).max(90).optional(),
  stock: numeric('موجودی معتبر نیست').int().min(0),
  unit: z.string().trim().max(20).optional(),
  weight: numeric().min(0).optional(),
  ingredients: z.array(z.string().trim().max(60)).max(20).optional(),
  usage: z.string().trim().max(1200).optional(),
  benefits: z.array(z.string().trim().max(120)).max(15).optional(),
  origin: z.string().trim().max(60).optional(),
  images: z.array(z.object({ url: z.string().refine((v) => /^\/uploads\/products\/[A-Za-z0-9._-]+$/.test(v) || /^\/images\//.test(v) || /^https?:\/\//.test(v), 'آدرس تصویر معتبر نیست'), alt: z.string().optional() })).max(6).optional(),
  isFeatured: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isActive: z.boolean().optional(),
};

export const createProductSchema = { body: z.object(base).strict() };

export const updateProductSchema = {
  body: z.object(Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v.optional()]))).strict(),
};

export const listProductsSchema = {
  query: z.object({
    search: z.string().trim().max(80).optional(),
    category: z.string().trim().optional(),
    minPrice: numeric().min(0).optional(),
    maxPrice: numeric().min(0).optional(),
    minRating: numeric().min(0).max(5).optional(),
    inStock: boolish.optional(),
    discounted: boolish.optional(),
    featured: boolish.optional(),
    popular: boolish.optional(),
    premium: boolish.optional(),
    sort: z.enum(['newest', 'cheapest', 'expensive', 'popular', 'discount', 'rating', 'relevance']).optional(),
    page: numeric().int().min(1).optional(),
    limit: numeric().int().min(1).max(60).optional(),
  }).strip(),
};

export const reviewSchema = {
  body: z.object({
    rating: numeric('امتیاز باید بین ۱ تا ۵ باشد').int().min(1).max(5),
    title: z.string().trim().max(120).optional(),
    comment: z.string().trim().min(5, 'متن نظر حداقل ۵ کاراکتر باشد').max(1500),
  }).strict(),
};
