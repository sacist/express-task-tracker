import { BaseController } from "#classes/base-controller"
import { UsersService } from "./users.service"
import z from "zod"

export class UsersController extends BaseController {
    private usersService = new UsersService()

    constructor() {
        super()
    }

    public createUser = this.run({
        body: z.object({
            email: z.email(),
            password: z.string().min(8),
            name: z.string(),
            passcode: z.string().optional()
        })
    }, async (req) => {
        const user = await this.usersService.createUser(req.body)
        return { message: 'Юзер создан', user }
    })
}