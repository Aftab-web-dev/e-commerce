import mongoose, { Schema, Document, Types } from "mongoose";

interface OrderItem {
  productId: Types.ObjectId;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

interface IOrder extends Document {
  userId: Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  totalItems: number;
  paymentIntentId?: string;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  email: string;
  phoneNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<OrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    totalItems: {
      type: Number,
      required: true,
    },
    paymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phoneNumber: String,
    notes: String,
  },
  { timestamps: true }
);

// Indexes for efficient querying
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
