import { BaseRepository } from "#classes/base-repository";
import { User,IUser } from "#modules/users/users.model";

class UserRepository extends BaseRepository<IUser>{
    constructor(){
        super(User,'user:')
    }
    async findByEmail(email:string){
        return this.model.findOne({email})
    }
}

export const userRepository=new UserRepository()