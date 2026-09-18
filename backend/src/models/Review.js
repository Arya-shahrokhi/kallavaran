import mongoose from 'mongoose';
import { Product } from './Product.js';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 120 },
    comment: { type: String, required: true, trim: true, maxlength: 1500 },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

// هر کاربر برای هر محصول یک نظر
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

/** بازمحاسبه امتیاز محصول با یک aggregate؛ جلوگیری از N+1 در خواندن لیست. */
reviewSchema.statics.syncProductRating = async function syncProductRating(productId) {
  const [stats] = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)), isApproved: true } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(productId, {
    rating: stats ? Math.round(stats.avg * 10) / 10 : 0,
    reviewsCount: stats ? stats.count : 0,
  });
};

reviewSchema.post('save', function afterSave(doc) {
  doc.constructor.syncProductRating(doc.product);
});
reviewSchema.post('findOneAndDelete', function afterDelete(doc) {
  if (doc) mongoose.model('Review').syncProductRating(doc.product);
});

export const Review = mongoose.model('Review', reviewSchema);
