import { Document,Schema, Types, model } from "mongoose";


export interface ITeam extends Document {
    createdBy: Types.ObjectId,
    name: string,
}

const teamSchema = new Schema<ITeam>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true
    },
}, { timestamps: true }
)

export const Team = model<ITeam>('Team', teamSchema)