import { Document, ObjectId, Schema, Types, model } from "mongoose";

export enum TaskStatuses {
    BACKLOG = 'backlog',
    IN_PROGRESS = 'in_progress',
    IN_TESTING = 'in_testing',
    DONE = 'done'
}

export interface ITask extends Document {
    createdBy: Types.ObjectId,
    name: string,
    description: string,
    completeBy: Date,
    workedBy: Types.ObjectId,
    status: TaskStatuses,
    teamId:Types.ObjectId
}

const taskSchema = new Schema<ITask>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: TaskStatuses,
        default: TaskStatuses.BACKLOG
    },
    description: {
        type: String,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true
    },
    workedBy: {
        type:Schema.Types.ObjectId,
    },
    completeBy:{
        type:Date,
        required:true
    },
    teamId:{
        type:Schema.Types.ObjectId,
        ref:"Team"
    }
}, { timestamps: true }
)

export const Task = model<ITask>('Task', taskSchema)