import { z } from 'zod';
import { ROLES } from '../models/User.js';

export const adminUpdateUserSchema = {
  body: z.object({
    role: z.enum(Object.values(ROLES)).optional(),
    isActive: z.boolean().optional(),
    name: z.string().trim().min(3).max(80).optional(),
  }).strict(),
};
