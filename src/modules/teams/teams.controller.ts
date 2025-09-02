import { BaseController, IValidatedRequest } from "#classes/base-controller"
import { IRequestWithUser } from "#middleware/auth.middleware"
import { ITeamMember } from "./team-members.model"
import { TeamsService } from "./teams.service"
import z from "zod"


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
        const teamMembership = req.teamMembership
        if (!teamMembership) {
            throw new Error('middleware failure')
        }
        const res = await this.teamsService.assignTaskToTeamMember(teamMembership, userId, taskId)
        return res
    })

}