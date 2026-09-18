import { api } from './api.js';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateMe: (payload) => api.put('/auth/me', payload),
  changePassword: (payload) => api.put('/auth/me/password', payload),
  addresses: () => api.get('/auth/me/addresses'),
  addAddress: (payload) => api.post('/auth/me/addresses', payload),
  updateAddress: (id, payload) => api.put(`/auth/me/addresses/${id}`, payload),
  removeAddress: (id) => api.delete(`/auth/me/addresses/${id}`),
};

export const productApi = {
  list: (params) => api.get('/products', { params }),
  get: (key) => api.get(`/products/${key}`),
  create: (payload) => api.post('/products', payload),
  update: (id, payload) => api.put(`/products/${id}`, payload),
  remove: (id) => api.delete(`/products/${id}`),
  uploadImages: (formData) => api.post('/products/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  reviews: (id, params) => api.get(`/products/${id}/reviews`, { params }),
  addReview: (id, payload) => api.post(`/products/${id}/reviews`, payload),
};

export const categoryApi = {
  list: (params) => api.get('/categories', { params }),
  create: (payload) => api.post('/categories', payload),
  update: (id, payload) => api.put(`/categories/${id}`, payload),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const cartApi = {
  get: () => api.get('/cart'),
  add: (product, quantity = 1) => api.post('/cart', { product, quantity }),
  update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart'),
};

export const wishlistApi = {
  get: () => api.get('/wishlist'),
  toggle: (productId) => api.post(`/wishlist/${productId}`),
};

export const orderApi = {
  create: (payload) => api.post('/orders', payload),
  mine: (params) => api.get('/orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  updateStatus: (id, orderStatus) => api.put(`/orders/${id}/status`, { orderStatus }),
};

export const adminApi = {
  stats: (params) => api.get('/admin/stats', { params }),
  products: (params) => api.get('/admin/products', { params }),
  orders: (params) => api.get('/admin/orders', { params }),
  reviews: (params) => api.get('/admin/reviews', { params }),
  users: (params) => api.get('/users', { params }),
  user: (id) => api.get(`/users/${id}`),
  updateUser: (id, payload) => api.put(`/users/${id}`, payload),
  removeUser: (id) => api.delete(`/users/${id}`),
  removeReview: (id) => api.delete(`/reviews/${id}`),
};
