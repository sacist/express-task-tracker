import { Router } from "express";
import { UsersController } from "./users.controller";
import { authMiddleware } from "#middleware/auth.middleware";

const controller=new UsersController()
const usersRouter=Router()

usersRouter.post('/',controller.createUser)
usersRouter.get('/me',authMiddleware,controller.getMe)
export default usersRouter