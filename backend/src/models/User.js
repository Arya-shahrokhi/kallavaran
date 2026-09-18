import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = { USER: 'USER', ADMIN: 'ADMIN' };

const addressSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: 'آدرس من' },
    receiver: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    line: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'نام الزامی است'], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, 'ایمیل الزامی است'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: [true, 'شماره موبایل الزامی است'], unique: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER, index: true },
    avatar: { url: String, publicId: String },
    addresses: [addressSchema],
    isActive: { type: Boolean, default: true },
    tokenVersion: { type: Number, default: 0, select: false },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.password;
        delete ret.tokenVersion;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// فقط یک آدرس پیش‌فرض
userSchema.pre('save', function normalizeAddresses(next) {
  if (this.isModified('addresses') && this.addresses.length) {
    const firstDefault = this.addresses.findIndex((a) => a.isDefault);
    this.addresses.forEach((a, i) => {
      a.isDefault = i === (firstDefault === -1 ? 0 : firstDefault);
    });
  }
  next();
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

export const User = mongoose.model('User', userSchema);
