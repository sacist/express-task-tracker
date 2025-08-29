import { Router } from "express";
import { UsersController } from "./users.controller";

const controller=new UsersController()
const usersRouter=Router()

usersRouter.post('/',controller.createUser)

export default usersRouter