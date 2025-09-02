import { Router } from "express";
import { TeamsController } from "./teams.controller";
import { authMiddleware } from "#middleware/auth.middleware";
import { checkTeamRoleMiddleware } from "#middleware/check-team-role.middleware";
import { TeamMemberRole } from "./team-members.model";

const controller=new TeamsController()
const teamsRouter=Router()

teamsRouter.post('/assign',authMiddleware,checkTeamRoleMiddleware(TeamMemberRole.PROJECT),controller.assignTask)

export default teamsRouter