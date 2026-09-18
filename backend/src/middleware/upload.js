import path from 'node:path';
import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_SIZE = 2 * 1024 * 1024; // ۲ مگابایت

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 6 },
  fileFilter(_req, file, cb) {
    const extOk = ['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(path.extname(file.originalname).toLowerCase());
    if (!ALLOWED.has(file.mimetype) || !extOk) {
      return cb(ApiError.badRequest('فقط تصویر با فرمت JPG، PNG، WEBP یا AVIF و حداکثر ۲ مگابایت مجاز است'));
    }
    return cb(null, true);
  },
}).array('images', 6);
