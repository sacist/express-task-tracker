import { Types } from "mongoose";
import { taskRepository } from "#repositories/task.repository";
import { ITeamMember, TeamMemberRole } from "#modules/teams/team-members.model";
import { teamMemberRepository } from "#repositories/team-member.repository";
import { ForbiddenError } from "#errors/forbidden.error";
import { NotFoundError } from "#errors/not-found.error";
import { ICreateTeamData, teamRepository } from "#repositories/team.repository";
import { redisClient } from "#config/redis";
import { randomUUID } from "crypto";
import { getAllInviteLinks, parseInviteLink } from "#helpers/teams";
import { TooManyRequestsError } from "#errors/too-many-requests.error";
import { ValidationError } from "#errors/validation.error";

export class TeamsService {
    async assignTaskToTeamMember(teamMembership: ITeamMember, assignUserId: string, taskId: string) {
        const teamMembers = await teamMemberRepository.findByTeamId(teamMembership.team_id.toString())
        const assignedTeamMember = teamMembers.find((m) => m.member_id.toString() === assignUserId)
        if (!assignedTeamMember) {
            throw new ForbiddenError({ text: 'Пользователь не состоит в вашей команде' })
        }
        const updatedTask = await taskRepository.update(taskId, { workedBy: new Types.ObjectId(assignUserId) })
        if (!updatedTask) {
            throw new NotFoundError({ text: 'Таск не найден' })
        }
        return updatedTask.save()
    }
    async createTeam(data: ICreateTeamData) {
        const team = await teamRepository.create(data)
        return team
    }
    async createInviteLink(teamMembership: ITeamMember, role: TeamMemberRole) {
        const domain = process.env.FRONTEND_DOMAIN || 'taskTracker'
        const uuid = randomUUID()
        const link = `http://${domain}/invite/${role}/${teamMembership.team_id}/${uuid}`
        const existingLinks = await getAllInviteLinks(teamMembership.team_id.toString())
        if (existingLinks.length >= 15) {
            throw new TooManyRequestsError({ text: 'Вы создали слишком много ссылкок, используйте уже созданные' })
        }
        await redisClient.setEx(`inviteLink:${teamMembership.team_id}:${uuid}`, 1800, link)
        return link
    }
    async joinTeamViaLink(link: string, userId: string) {
        const parsedLink = parseInviteLink(link)
        if (!parsedLink) {
            throw new ValidationError({ text: 'Ссылка повреждена' })
        }
        const { role, teamId, uuid } = parsedLink
        const linkFromRedis = await redisClient.get(`inviteLink:${teamId}:${uuid}`)
        if (!linkFromRedis) {
            throw new NotFoundError({ text: 'Ссылка больше недействительна' })
        }
        if (linkFromRedis !== link) {
            throw new ForbiddenError({ text: 'Ссылка ненастоящая' })
        }
        try {
            const createdTeamMember = await teamMemberRepository.createMember({
                team_id: teamId,
                member_id: userId,
                role
            })
            return createdTeamMember
        } catch (e: any) {
            if (e.code === 11000) {
                throw new ForbiddenError({ text: 'Вы уже состоите в этой команде' })
            }
            throw e
        }
    }
    async getAllUsersTeams(userId:string){
        const userMemberships=await teamMemberRepository.findByUserId(userId)
        if(userMemberships.length===0){
            throw new NotFoundError({text:"Вы не состоите ни в одной команде"})
        }
        const res=[]
        for(const mem of userMemberships){
            const team=await teamRepository.findById(mem.team_id.toString())
            res.push({...team?.toJSON(),role:mem.role})
        }
        return res
    }
}