import { NextFunction, Request, Response } from "express";
import { teamMemberRepository } from "#repositories/team-member.repository";
import { ForbiddenError } from "#errors/forbidden.error";

export const roleLevels: Record<string, number> = {
    teamlead: 4,
    project_manager: 2,
    product_manager: 3,
    worker: 1,
};

export const checkTeamRoleMiddleware = (minRoleName: keyof typeof roleLevels) => {
    return async (req: Request, _: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user._id
            
            const teamId = req.params.teamId || req.query.teamId
            
            if (!teamId) {
                return next(new ForbiddenError({text: "Не указан teamId"}))
            }

            const memberships = await teamMemberRepository.findByUserId(userId)
            const membership = memberships.find((m) => m.team_id.toString() === teamId)
            
            if (!membership) {
                return next(new ForbiddenError({text: "Вы не состоите в этой команде"}))
            }
            const userRole = membership.role;

            if (roleLevels[userRole] < roleLevels[minRoleName]) {
                return next(new ForbiddenError({text: "Недостаточно прав"}))
            }

            (req as any).teamMembership = membership

            next();
        } catch (error) {
            next(error)
        }
    }
}
