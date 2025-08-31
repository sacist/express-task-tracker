import { Router } from "express";
import { AuthController } from "./auth.controller";

const controller=new AuthController()
const authRouter=Router()

authRouter.post('/',controller.login)

export default authRouter