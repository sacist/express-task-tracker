import { Types } from "mongoose";
import { GetTasksRole, taskRepository } from "#repositories/task.repository";
import { ITeamMember } from "#modules/teams/team-members.model";
import { teamMemberRepository } from "#repositories/team-member.repository";
import { ForbiddenError } from "#errors/forbidden.error";
import { NotFoundError } from "#errors/not-found.error";
import { ICreateTeamData, teamRepository } from "#repositories/team.repository";



export class TeamsService {
    async assignTaskToTeamMember(teamMembership:ITeamMember,assignUserId:string,taskId:string){
        const teamMembers=await teamMemberRepository.findByTeamId(teamMembership.team_id.toString())
        const assignedTeamMember=teamMembers.find((m)=>m.member_id.toString()===assignUserId)
        if(!assignedTeamMember){
            throw new ForbiddenError({text:'Пользователь не состоит в вашей команде'})
        }
        const updatedTask=await taskRepository.update(taskId,{workedBy:new Types.ObjectId(assignUserId)})
        if(!updatedTask){
            throw new NotFoundError({text:'Таск не найден'})
        }
        return updatedTask.save()
    }
    async createTeam(data:ICreateTeamData){
        const team=await teamRepository.create(data)
        return team
    }
}