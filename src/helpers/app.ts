import { IRequestWithUser } from "#middleware/auth.middleware"
import { UnauthorizedError } from "#errors/unauthorized.error"
import { IUser } from "#modules/users/users.model"

export const getUserFromRequest=(req:IRequestWithUser):IUser=>{
    const user=req.user
    if(!user){
        throw new UnauthorizedError({ text: 'Вы не были авторизованы, повторите попытку' })
    }
    return user
}