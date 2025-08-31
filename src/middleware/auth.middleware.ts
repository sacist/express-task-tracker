import { jwtAccessConf, jwtRefreshConf } from "#config/jwt";
import { UnauthorizedError } from "#errors/unauthorized.error";
import { IAccessTokenPayload, IRefreshTokenPayload } from "#modules/users/auth/auth.service";
import { RefreshToken } from "#modules/users/auth/tokens.model";
import { User } from "#modules/users/users.model";
import { NextFunction,Request,Response } from "express";
import jwt from 'jsonwebtoken'

export interface IRequestWithUser extends Request{
    user?:IAccessTokenPayload
}
export const authMiddleware=async(req:IRequestWithUser,res:Response,next:NextFunction)=>{
    try {
        const authHeader=req.headers["authorization"]
        const accessToken=authHeader?.split(" ")[1]
        if(!accessToken) return next(new UnauthorizedError({text:'Access токен отсутствует'}))

        const payload=jwt.verify(accessToken,jwtAccessConf.secret) as IAccessTokenPayload

        req.user=payload
        next()
    } catch (e:any) {
        if(e.name!=='TokenExpiredError'){
            if(e instanceof jwt.JsonWebTokenError||e instanceof SyntaxError){
                return next(new UnauthorizedError({text:'access токен не валидный, перелогиньтесь'}))
            }else{
                return next(e)
            }
        }
        
        const refreshToken=req.cookies?.refreshToken||req.headers['x-refresh-token']
        if(!refreshToken) return next(new UnauthorizedError({text:'Refresh токен отсутствует'}))
        
        try {
            const refreshPayload=jwt.verify(refreshToken,jwtRefreshConf.secret) as IRefreshTokenPayload

            const dbToken=await RefreshToken.findOne({token_id:refreshPayload.token_id,user_id:refreshPayload.id})
            if(!dbToken) return next(new UnauthorizedError({ text: 'Refresh токен недействителен' }))
            
            const user=await User.findById(refreshPayload.id)
            if(!user) return next(new UnauthorizedError({text:'Пользователь не найден'}))

            const newAccessPayload:IAccessTokenPayload={
                id:user._id,
                role:user.role
            }
            const newAccessToken=jwt.sign(newAccessPayload,jwtAccessConf.secret,jwtAccessConf.options)
            res.setHeader('authorization', 'Bearer: '+newAccessToken)
            req.user=newAccessPayload
            next()
        } catch (_) {
            return next(new UnauthorizedError({ text: 'Refresh токен недействителен' }))
        }
    }
}