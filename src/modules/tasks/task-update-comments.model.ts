import { Document, Schema, Types, model } from "mongoose";

export interface ITaskUpdateComment extends Document {
    updatedBy: Types.ObjectId,
    comment: string,
    forVersion: number,
    taskId: Types.ObjectId
}

const taskUpdateCommentsSchema = new Schema<ITaskUpdateComment>({
    updatedBy: {
        type: Schema.Types.ObjectId,
        required: true
    },
    comment: {
        type: String,
        default: ""
    },
    forVersion: {
        type: Number,
        required: true
    },
    taskId: {
        type: Schema.Types.ObjectId,
        required: true
    }
}, { timestamps: true }
)

export const TaskUpdateComment = model<ITaskUpdateComment>('TaskUpdateComment', taskUpdateCommentsSchema)