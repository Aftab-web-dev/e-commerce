import mongoose, { Schema, Document } from "mongoose";

interface ProductType extends Document {
  productName: string;
  price: number;
  description: string;
  category: string;
  rating?: number;
}

const productSchema = new Schema<ProductType>({
    // Define product fields here
    productName: { 
        type: String, 
        required: true,
        trim: true,
    },
    price: { 
        type: Number, 
        required: true, 
    },
    description: { 
        type: String, 
        required: true,
        trim: true,
    },
    category: { 
        type: String,
        required: true,
        trim: true,
    },
    rating:{
        type: Number,
        default: 0, 
    }

}, { timestamps: true });

export const ProductModel = mongoose.model<ProductType>("Product", productSchema);