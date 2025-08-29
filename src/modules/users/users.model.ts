import { Document, Schema, model } from "mongoose";

export enum UserRoles {
    USER = 'user',
    ADMIN = 'admin'
}

export interface IUser extends Document {
    name: string,
    email: string,
    password: string,
    role: UserRoles,
    createdAt: Date,
    updatedAt: Date
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
        requied: true,
        minlength: 8
    },
    role: {
        type: String,
        enum: UserRoles,
        default: UserRoles.USER
    }
}, { timestamps: true }
)

export const User = model<IUser>('User', userSchema)