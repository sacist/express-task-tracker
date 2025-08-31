import { NextFunction, Response } from "express"
import { IRequestWithUser } from "./auth.middleware"
import { UserRoles } from "#modules/users/users.model"
import { ForbiddenError } from "#errors/forbidden.error"

export const checkIfAdmin=(req:IRequestWithUser, __:Response, next: NextFunction) => {
    const user=req.user
    if(user.role!==UserRoles.ADMIN){
        return next(new ForbiddenError({text:'Недостаточно прав для запроса'}))
    }
    next()
}