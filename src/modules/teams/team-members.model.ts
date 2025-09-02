import { Document,Schema, Types, model } from "mongoose";


export enum TeamMemberRole{
    TEAMLEAD='teamlead',
    WORKER='worker',
    PROJECT='project_manager',
    PRODUCT='product_manager'
}

export interface ITeamMember extends Document {
    member_id: Types.ObjectId,
    team_id:Types.ObjectId,
    role:TeamMemberRole
}

const teamMemberSchema = new Schema<ITeamMember>({
    team_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:'Team'
    },
    member_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:"User"
    },
    role:{
        type:String,
        default:TeamMemberRole.WORKER,
        enum:TeamMemberRole
    }
}, { timestamps: true }
)

export const TeamMember = model<ITeamMember>('Team', teamMemberSchema)