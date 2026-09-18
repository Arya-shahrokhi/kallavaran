import { z } from 'zod';
import { numeric, objectId } from './common.js';

export const createCategorySchema = {
  body: z.object({
    name: z.string().trim().min(2, 'نام دسته‌بندی الزامی است').max(60),
    description: z.string().trim().max(500).optional(),
    icon: z.string().trim().max(40).optional(),
    image: z.object({ url: z.string().url() }).optional(),
    parent: objectId.nullable().optional(),
    order: numeric().int().optional(),
    isActive: z.boolean().optional(),
  }).strict(),
};

export const updateCategorySchema = {
  body: createCategorySchema.body.partial(),
};
