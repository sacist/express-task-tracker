import { BaseController } from "#classes/base-controller"
import { Types } from "mongoose"
import { TasksService } from "./tasks.service"
import z from "zod"
import { TaskStatuses } from "./tasks.model"
import { GetTasksRole } from "#repositories/task.repository"
import { IValidatedRequest } from "#classes/base-controller"
import { getUserFromRequest, getTeamMembershipFromRequset } from "#helpers/app"
import { IRequestWithTeamMembership } from "#modules/teams/teams.controller"


const taskCreationBodySchema = {
    body: z.object({
        name: z.string().min(3),
        description: z.string().optional(),
        completeBy: z.coerce.date(),
        status: z.enum(["backlog", "in_progress", "in_testing", "done"]).optional()
    })
}

export class TasksController extends BaseController {
    private tasksService = new TasksService()

    constructor() {
        super()
    }

    public createTask = this.run<IValidatedRequest>(taskCreationBodySchema, async (req) => {
        const user = getUserFromRequest(req)
        const { name, description, completeBy, status}=req.validatedBody
        const task = await this.tasksService.createTask({
            createdBy: user._id as Types.ObjectId,
            name,
            description,
            completeBy,
            status: status || TaskStatuses.BACKLOG
        })
        return task
    })
    public createTaskForTeam = this.run<IRequestWithTeamMembership>(taskCreationBodySchema, async (req) => {
        const user = getUserFromRequest(req)
        const teamMembership = getTeamMembershipFromRequset(req)
        const { name, description, completeBy, status}=req.validatedBody
        const teamId = teamMembership.team_id
        const task = await this.tasksService.createTaskForTeam({
            createdBy: user._id as Types.ObjectId,
            name,
            description,
            completeBy,
            status: status || TaskStatuses.BACKLOG,
            teamId
        })
        return task
    })
    public getMyTasksPaginated = this.run<IValidatedRequest>({
        query: z.object({
            page: z.string().optional(),
            role: z.enum(GetTasksRole),
            status: z.enum(TaskStatuses).optional()
        })
    }, async (req) => {
        const user = getUserFromRequest(req)
        const { page,role, status } = req.validatedQuery
        const pageNumber = Number(page) || 1
        const tasks = this.tasksService.getMyTasks(user._id as string, pageNumber, role, status)
        return tasks
    })
    public getAllTeamTasks=this.run<IRequestWithTeamMembership>({
        query:z.object({
            page:z.string().optional(),
            status:z.enum(TaskStatuses).optional()
        }),
        params:z.object({
            teamId:z.string()
        })
    },async(req)=>{
        const {page, status}=req.validatedQuery
        const {teamId}=req.validatedParams
        const pageNumber = Number(page) || 1
        const tasks=this.tasksService.getAllTeamsTasks(teamId,pageNumber,status)
        return tasks
    })
    public getFullTask=this.run<IValidatedRequest>({
        params:z.object({
            taskId:z.string()
        })
    },async(req)=>{
        const user=getUserFromRequest(req)
        const {taskId}=req.validatedParams
        const res=await this.tasksService.getFullTaskInfo(taskId,user._id as Types.ObjectId)
        return res
    })
    public updateTask = this.run<IValidatedRequest>({
        query: z.object({
            taskId: z.string()
        }),
        body: z.object({
            status: z.enum(TaskStatuses),
            comment: z.string()
        })
    }, async (req) => {
        const user = getUserFromRequest(req)
        const userId = (user._id as Types.ObjectId).toString()

        const { taskId } = req.validatedQuery
        const { status, comment } = req.validatedBody
        const res = await this.tasksService.updateTask(taskId, status, comment, userId)
        return res
    })
}