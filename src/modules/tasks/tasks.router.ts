import { Router } from "express";
import { TasksController } from "./tasks.controller";
import { authMiddleware } from "#middleware/auth.middleware";

const controller=new TasksController()
const tasksRouter=Router()

tasksRouter.post('/',authMiddleware,controller.createTask)
tasksRouter.get('/',authMiddleware,controller.getMyTasksPaginated)
tasksRouter.patch('/',authMiddleware,controller.updateTask)

export default tasksRouter