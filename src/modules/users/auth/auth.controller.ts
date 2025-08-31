import { BaseController } from "#classes/base-controller"
import { Request, Response } from "express"
import { AuthService } from "./auth.service"
import z from "zod"

export class AuthController extends BaseController {
    private authService = new AuthService()

    constructor() {
        super()
    }

    public login=this.run({
        body:z.object({
            email:z.email(),
            password:z.string().min(8)
        })
    },async(req:Request,res:Response)=>{
        const {email,password}=req.body
        const tokens=await this.authService.login(email,password)
        res.setHeader('authorization', 'Bearer: '+tokens.accessToken)
        res.setHeader('x-refresh-token', tokens.refreshToken)
        return tokens
    })
}