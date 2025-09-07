import { BaseController, IValidatedRequest } from "#classes/base-controller"
import { Types } from "mongoose"
import { ITeamMember, TeamMemberRole } from "./team-members.model"
import { TeamsService } from "./teams.service"
import z from "zod"
import { UnauthorizedError } from "#errors/unauthorized.error"
import { IRequestWithUser } from "#middleware/auth.middleware"
import { getTeamMembershipFromRequset, getUserFromRequest } from "#helpers/app"

export interface IRequestWithTeamMembership extends IValidatedRequest {
    teamMembership?: ITeamMember
}
export class TeamsController extends BaseController {
    private teamsService = new TeamsService()

    constructor() {
        super()
    }
    public assignTask = this.run<IRequestWithTeamMembership>({
        query: z.object({
            taskId: z.string(),
            userId: z.string()
        })
    }, async (req) => {
        const { taskId, userId } = req.validatedQuery
        const teamMembership = getTeamMembershipFromRequset(req)
        const res = await this.teamsService.assignTaskToTeamMember(teamMembership, userId, taskId)
        return res
    })

    public createTeam = this.run<IValidatedRequest>({
        body: z.object({
            name: z.string(),
            role: z.enum(TeamMemberRole)
        })
    }, async (req) => {
        const { name, role } = req.validatedBody
        const user = getUserFromRequest(req)
        const res = await this.teamsService.createTeam({ name, role, createdBy: new Types.ObjectId(user._id as string) })
        return res
    })

    public createInviteLink = this.run<IRequestWithTeamMembership>({
        query: z.object({
            role: z.enum(TeamMemberRole)
        })
    }, async (req) => {
        const teamMembership = getTeamMembershipFromRequset(req)
        const { role } = req.validatedQuery
        const inviteLink = await this.teamsService.createInviteLink(teamMembership, role)
        return inviteLink
    })
    public joinTeamViaLink = this.run<IValidatedRequest>({
        body: z.object({
            link: z.string()
        })
    }, async (req) => {
        const { link } = req.validatedBody
        const user = getUserFromRequest(req)
        const res = await this.teamsService.joinTeamViaLink(link, user._id as string)
        return res
    })
    public getAllMyTeams = this.run<IRequestWithUser>(null, async (req) => {
        const user = getUserFromRequest(req)
        const res=await this.teamsService.getAllUsersTeams(user._id as string)
        return res
    })
}