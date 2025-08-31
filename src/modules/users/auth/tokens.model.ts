import { Document, ObjectId, Schema, model } from "mongoose";


export interface IRefreshToken extends Document {
    token:string,
    token_id:string,
    user_id:ObjectId
}

const refreshTokenSchema = new Schema<IRefreshToken>({
    token:{
        type:String,
        unique:true,
        trim:true,
        required:true
    },
    token_id:{
        type:String,
        unique:true,
        required:true
    },
    user_id:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
}, { timestamps: true }
)

export const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema)