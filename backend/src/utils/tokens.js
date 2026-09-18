import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAccessToken = (user) =>
  jwt.sign({ sub: String(user._id), role: user.role }, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpires });

export const signRefreshToken = (user) =>
  jwt.sign({ sub: String(user._id), tv: user.tokenVersion ?? 0 }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires,
  });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);
export const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

export const REFRESH_COOKIE = 'attari_rt';

export const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'strict' : 'lax',
  path: '/api/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000,
});
