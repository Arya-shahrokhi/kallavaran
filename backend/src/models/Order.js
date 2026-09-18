import mongoose from 'mongoose';

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const PAYMENT_STATUS = { UNPAID: 'UNPAID', PAID: 'PAID', REFUNDED: 'REFUNDED', FAILED: 'FAILED' };

/** ترتیب مجاز تغییر وضعیت؛ جلوی پرش‌های نامعتبر را می‌گیرد. */
export const STATUS_FLOW = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

// snapshot محصول: سفارش سند تاریخی است و با تغییر محصول نباید عوض شود.
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    slug: String,
    image: String,
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    receiver: { type: String, required: true },
    phone: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    line: { type: String, required: true },
    note: String,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    shippingAddress: { type: shippingAddressSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['COD', 'GATEWAY'], default: 'COD' },
    paymentStatus: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.UNPAID, index: true },
    // جای اتصال درگاه ایرانی در آینده، بدون تغییر بقیه اسکیما
    payment: { provider: String, authority: String, refId: String, paidAt: Date },
    orderStatus: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING, index: true },
    statusHistory: [{ status: String, at: { type: Date, default: Date.now }, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

orderSchema.pre('validate', function setOrderNumber(next) {
  if (!this.orderNumber) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `AT-${Date.now().toString(36).toUpperCase()}${rand}`;
  }
  next();
});

export const Order = mongoose.model('Order', orderSchema);
