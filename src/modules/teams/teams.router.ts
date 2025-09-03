import { Router } from "express";
import { TeamsController } from "./teams.controller";
import { authMiddleware } from "#middleware/auth.middleware";
import { checkTeamRoleMiddleware } from "#middleware/check-team-role.middleware";
import { TeamMemberRole } from "./team-members.model";

const controller=new TeamsController()
const teamsRouter=Router()

teamsRouter.post('/tasks/assign',authMiddleware,checkTeamRoleMiddleware(TeamMemberRole.PROJECT),controller.assignTask)
teamsRouter.post('/',authMiddleware,controller.createTeam)

export default teamsRouter