import { BaseController } from "#classes/base-controller"
import { UnauthorizedError } from "#errors/unauthorized.error"
import { IRequestWithUser } from "#middleware/auth.middleware"
import { Types } from "mongoose"
import { TasksService } from "./tasks.service"
import z from "zod"
import { TaskStatuses } from "./tasks.model"
import { GetTasksRole } from "#repositories/task.repository"
import { IValidatedRequest } from "#classes/base-controller"

export class TasksController extends BaseController {
    private tasksService = new TasksService()

    constructor() {
        super()
    }

    public createTask = this.run<IValidatedRequest>({
        body: z.object({
            name: z.string().min(3),
            description: z.string().optional(),
            completeBy: z.coerce.date(),
            status: z.enum(["backlog", "in_progress", "in_testing", "done"]).optional()
        })
    }, async (req) => {
        if (!req.user) throw new UnauthorizedError({ text: "Пользователь не авторизован" })

        const task = await this.tasksService.createTask({
            createdBy: req.user._id as Types.ObjectId,
            name: req.validatedBody.name,
            description: req.validatedBody.description,
            completeBy: req.validatedBody.completeBy,
            status: req.validatedBody.status || TaskStatuses.BACKLOG,
        })

        return { message: "Задача создана", task }
    })
    public getMyTasksPaginated = this.run<IValidatedRequest>({
        body: z.object({
            role: z.enum(GetTasksRole),
            status: z.enum(TaskStatuses).optional()
        }),
        query: z.object({
            page: z.string().optional()
        })
    }, async (req) => {
        if (!req.user) throw new UnauthorizedError({ text: "Пользователь не авторизован" })

        const { role, status } = req.validatedBody
        const { page } = req.validatedQuery
        const pageNumber = Number(page) || 1
        const tasks = this.tasksService.getMyTasks(req.user._id as string, pageNumber, role, status)
        return tasks
    })
}