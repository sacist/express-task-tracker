import { BaseController } from "#classes/base-controller"
import { UnauthorizedError } from "#errors/unauthorized.error"
import { IRequestWithUser } from "#middleware/auth.middleware"
import { Types } from "mongoose"
import { TasksService } from "./tasks.service"
import z from "zod"
import { TaskStatuses } from "./tasks.model"
import { GetTasksRole } from "#repositories/task.repository"
import { IValidatedRequest } from "#classes/base-controller"
import { getUserFromRequest } from "#helpers/app"

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
        const user=getUserFromRequest(req)

        const task = await this.tasksService.createTask({
            createdBy: user._id as Types.ObjectId,
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
        const user=getUserFromRequest(req)

        const { role, status } = req.validatedBody
        const { page } = req.validatedQuery
        const pageNumber = Number(page) || 1
        const tasks = this.tasksService.getMyTasks(user._id as string, pageNumber, role, status)
        return tasks
    })
    public updateTask=this.run<IValidatedRequest>({
        query:z.object({
            taskId:z.string()
        }),
        body:z.object({
            status:z.enum(TaskStatuses),
            comment:z.string()
        })
    },async(req)=>{
        const user=getUserFromRequest(req)
        const userId=(user._id as Types.ObjectId).toString()
        
        const {taskId}=req.validatedQuery
        const {status,comment}=req.validatedBody
        const res=await this.tasksService.updateTask(taskId,status,comment,userId)
        return res
    })
}