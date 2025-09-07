import { IRequestWithUser } from "#middleware/auth.middleware"
import { UnauthorizedError } from "#errors/unauthorized.error"
import { IUser } from "#modules/users/users.model"
import { IRequestWithTeamMembership } from "#modules/teams/teams.controller"
import { ITeamMember } from "#modules/teams/team-members.model"

export const getUserFromRequest=(req:IRequestWithUser):IUser=>{
    const user=req.user
    if(!user){
        throw new UnauthorizedError({ text: 'Вы не были авторизованы, повторите попытку' })
    }
    return user
}

export const getTeamMembershipFromRequset=(req:IRequestWithTeamMembership):ITeamMember=>{
    const teamMembership=req.teamMembership
    if(!teamMembership){
        throw new UnauthorizedError({ text: 'Ошибка авторизации' }) 
    }
    return teamMembership
}