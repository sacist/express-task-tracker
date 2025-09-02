import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, UserRoles } from "../users.model";
import { UnauthorizedError } from "#errors/unauthorized.error";
import { jwtRefreshConf, jwtAccessConf } from "#config/jwt";
import { NotFoundError } from "#errors/not-found.error";
import { randomUUID } from "crypto";
import { RefreshToken } from "./tokens.model";
import { userRepository } from "#repositories/user.repository";
import { tokenRepository } from "#repositories/token.repository";

interface ILoginReturn{
    accessToken:string,
    refreshToken:string
}
export interface IAccessTokenPayload{
    id:unknown,
    role:UserRoles
}
export interface IRefreshTokenPayload{
    id:unknown,
    token_id:string
}
export class AuthService {
    async login(email: string, password: string):Promise<ILoginReturn> {
            const user = await userRepository.findByEmail(email)
            if (!user) {
                throw new NotFoundError({ text: 'Пользователь с таким email не найден', code: 404 })
            }
            const passwordMatch = await bcrypt.compare(password, user.password)
            if (!passwordMatch) {
                throw new UnauthorizedError({ text: "Неверный пароль", code: 401 })
            }
            const UUID = randomUUID()
            const refreshPayload:IRefreshTokenPayload = {
                id: user._id,
                token_id: UUID
            }
            const accessPayload:IAccessTokenPayload = {
                id: user._id,
                role: user.role
            }
            
            const refreshToken = jwt.sign(refreshPayload, jwtRefreshConf.secret, jwtRefreshConf.options)
            const accessToken = jwt.sign(accessPayload, jwtAccessConf.secret, jwtAccessConf.options)
    
            await tokenRepository.create({token_id:UUID,user_id:user._id as string,token:refreshToken})
    
            return{accessToken,refreshToken}
    }
}