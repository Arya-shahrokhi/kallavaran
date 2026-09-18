import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, max: 50, default: 1 },
    // قیمت لحظه افزودن، فقط برای نمایش تغییر قیمت؛ مبلغ نهایی همیشه از Product خوانده می‌شود.
    priceAtAdd: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, sparse: true, default: null },
    guestId: { type: String, index: true, sparse: true, default: null },
    items: { type: [cartItemSchema], default: [] },
    couponCode: { type: String, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

cartSchema.index({ updatedAt: -1 });

export const Cart = mongoose.model('Cart', cartSchema);
