import mongoose, { Schema, Document, Types } from "mongoose";

interface CartItem {
  productId: Types.ObjectId;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

interface ICart extends Document {
  userId: Types.ObjectId;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
  addItem(productId: Types.ObjectId, productName: string, price: number, quantity: number): Promise<void>;
  removeItem(productId: Types.ObjectId): Promise<void>;
  updateItemQuantity(productId: Types.ObjectId, quantity: number): Promise<void>;
  clearCart(): Promise<void>;
  calculateTotals(): void;
}

const cartItemSchema = new Schema<CartItem>(
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

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Method to calculate totals
cartSchema.methods.calculateTotals = function () {
  this.totalAmount = this.items.reduce((sum: number, item: CartItem) => sum + item.totalPrice, 0);
  this.totalItems = this.items.reduce((count: number, item: CartItem) => count + item.quantity, 0);
};

// Method to add item to cart
cartSchema.methods.addItem = async function (
  productId: Types.ObjectId,
  productName: string,
  price: number,
  quantity: number
) {
  const existingItem = this.items.find((item: CartItem) => item.productId.toString() === productId.toString());

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.totalPrice = existingItem.quantity * existingItem.price;
  } else {
    this.items.push({
      productId,
      productName,
      price,
      quantity,
      totalPrice: price * quantity,
    });
  }

  this.calculateTotals();
  await this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function (productId: Types.ObjectId) {
  this.items = this.items.filter((item: CartItem) => item.productId.toString() !== productId.toString());
  this.calculateTotals();
  await this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function (productId: Types.ObjectId, quantity: number) {
  if (quantity <= 0) {
    await this.removeItem(productId);
    return;
  }

  const item = this.items.find((item: CartItem) => item.productId.toString() === productId.toString());

  if (item) {
    item.quantity = quantity;
    item.totalPrice = item.quantity * item.price;
    this.calculateTotals();
    await this.save();
  }
};

// Method to clear cart
cartSchema.methods.clearCart = async function () {
  this.items = [];
  this.calculateTotals();
  await this.save();
};

export const CartModel = mongoose.model<ICart>("Cart", cartSchema);
