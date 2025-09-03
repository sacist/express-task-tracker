import { BaseRepository } from "#classes/base-repository";
import { Team,ITeam } from "#modules/teams/teams.model";
import { Types } from "mongoose";
import { teamMemberRepository } from "./team-member.repository";
import { TeamMemberRole } from "#modules/teams/team-members.model";

export interface ICreateTeamData extends Partial<ITeam>{
    role:TeamMemberRole
}

class TeamRepository extends BaseRepository<ITeam>{
    constructor(){
        super(Team,'team:')
    }
    async create(data:ICreateTeamData):Promise<ITeam>{
        const {role, ...teamData}=data
        const team=await super.create(teamData)
        await teamMemberRepository.create({member_id:team.createdBy,team_id:team._id as Types.ObjectId,role:data.role})
        return team
    }
}

export const teamRepository=new TeamRepository()