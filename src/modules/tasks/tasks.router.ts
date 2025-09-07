import { Router } from "express";
import { TasksController } from "./tasks.controller";
import { authMiddleware } from "#middleware/auth.middleware";
import { checkTeamRoleMiddleware } from "#middleware/check-team-role.middleware";

const controller = new TasksController()
const tasksRouter = Router()

tasksRouter.post('/', authMiddleware, controller.createTask)
tasksRouter.post('/team', authMiddleware, checkTeamRoleMiddleware('project_manager'), controller.createTaskForTeam)

tasksRouter.get('/', authMiddleware, controller.getMyTasksPaginated)
tasksRouter.get('/team/:teamId',authMiddleware,checkTeamRoleMiddleware('worker'),controller.getAllTeamTasks)
tasksRouter.get('/:taskId',authMiddleware,controller.getFullTask)
tasksRouter.patch('/', authMiddleware, controller.updateTask)

export default tasksRouter