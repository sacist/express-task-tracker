// models/User.ts
import { Document, Schema, model } from "mongoose";

export enum UserRoles {
  USER = 'user',
  ADMIN = 'admin'
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRoles;
  createdAt: Date;
  updatedAt: Date;
  banned: boolean;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true, // Исправил опечатку: было "requied"
    minlength: 8
  },
  role: {
    type: String,
    enum: UserRoles,
    default: UserRoles.USER
  },
  banned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

userSchema.set('toJSON', {
  transform: (doc: Document, ret: Record<string, any>) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

userSchema.set('toObject', {
  transform: (doc: Document, ret: Record<string, any>) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

export const User = model<IUser>('User', userSchema);