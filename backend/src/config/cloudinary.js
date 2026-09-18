import { v2 as cloudinary } from 'cloudinary';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from './env.js';

if (env.cloudinary.enabled) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

/** آپلود بافر به Cloudinary؛ در صورت غیرفعال بودن، null برمی‌گرداند تا ذخیره محلی انجام شود. */
export async function uploadBuffer(buffer, folder = 'attari/products', mimetype = 'image/jpeg') {
  if (!env.cloudinary.enabled) {
    const extension = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }[mimetype]) || 'jpg';
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${extension}`;
    const relativeDir = path.join('uploads', 'products');
    const absoluteDir = path.resolve(relativeDir);
    await mkdir(absoluteDir, { recursive: true });
    await writeFile(path.join(absoluteDir, filename), buffer);
    return { url: `/uploads/products/${filename}`, publicId: null };
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => (error ? reject(error) : resolve({ url: result.secure_url, publicId: result.public_id })),
    );
    stream.end(buffer);
  });
}

export async function destroyImage(publicId) {
  if (!env.cloudinary.enabled || !publicId) return;
  await cloudinary.uploader.destroy(publicId);
}
