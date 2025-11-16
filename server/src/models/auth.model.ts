import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface IAuth extends Document {
  username: string;
  email: string;
  fullName: string;
  password: string;
  refreshToken?: string;
  createdAt: Date;
  isPasswordMatch(enteredPassword: string): Promise<boolean>;
  generateJWT(): string;
  generateRefreshToken(): string;
}

const authSchema = new Schema<IAuth>({
     username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
}, { timestamps: true });

// Hash password before saving the user model
authSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
 });

// Method to compare entered password with hashed password
authSchema.methods.isPasswordMatch = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Method to generate JWT token
authSchema.methods.generateJWT = function () {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new Error("ACCESS_TOKEN_SECRET is not set");
    }

    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
      },
      secret as jwt.Secret,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
      } as jwt.SignOptions
    );
}

authSchema.methods.generateRefreshToken = function () {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
      throw new Error("REFRESH_TOKEN_SECRET is not set");
    }
    return jwt.sign(
        {
            _id: this._id,
        },
        secret as jwt.Secret,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
        } as jwt.SignOptions
    )
}

export const AuthModel = mongoose.model<IAuth>("Auth", authSchema);