import { ConflictError } from "#errors/conflict.error";
import { User, IUser, UserRoles } from "./users.model";
import * as bcrypt from 'bcrypt'
import { MongoServerError } from "mongodb";

export type UserCreation = Pick<IUser, 'name' | 'password' | 'email'> & {
    passcode?: string
}

export class UsersService {
    async createUser(data: UserCreation) {
        try {
            let role: UserRoles
            if (data.passcode && data.passcode === 'Wanna_be_admin') {
                role = UserRoles.ADMIN
            } else {
                role = UserRoles.USER
            }
            const hashedPwd = await bcrypt.hash(data.password, 10)
            const user = new User({
                ...data,
                password: hashedPwd,
                role
            })
            await user.save()
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