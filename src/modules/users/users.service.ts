import { ConflictError } from "#errors/conflict.error";
import { User, IUser, UserRoles } from "./users.model";
import * as bcrypt from 'bcrypt'
import { MongoServerError } from "mongodb";
import { userRepository } from "#repositories/user.repository";

export type UserCreation = Pick<IUser, 'name' | 'password' | 'email'> & {
    passcode?: string
}


export class UsersService {
    private repository=userRepository
    async createUser(data: UserCreation) {
        try {
            let role: UserRoles
            if (data.passcode && data.passcode === 'Wanna_be_admin') {
                role = UserRoles.ADMIN
            } else {
                role = UserRoles.USER
            }
            const hashedPwd = await bcrypt.hash(data.password, 10)
            const user=await this.repository.create({
                ...data,
                password: hashedPwd,
                role
            })
            return user
        } catch (e) {
            const err=e as MongoServerError
            if(err.code===11000){
                throw new ConflictError({text:"Данный email уже зарегестрирован",code:err.code,data:{email:data.email}})
            }
            throw e
        }
    }
}