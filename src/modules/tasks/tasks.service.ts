import { Types } from "mongoose";
import { TaskStatuses } from "./tasks.model";
import { GetTasksRole, taskRepository } from "#repositories/task.repository";
import { NotFoundError } from "#errors/not-found.error";
import { ForbiddenError } from "#errors/forbidden.error";
import { taskUpdateCommentRepository } from "#repositories/task-update-comment.repository";
import { teamRepository } from "#repositories/team.repository";
import { teamMemberRepository } from "#repositories/team-member.repository";


interface ICreateTaskData {
    createdBy: Types.ObjectId
    name: string,
    status: TaskStatuses,
    description?: string,
    completeBy: Date
}
interface ICreateForTeamData extends ICreateTaskData{
    teamId?:Types.ObjectId
}
export class TasksService {
    async createTask(data: ICreateTaskData) {
        const task = await taskRepository.create(data)
        return task
    }
    async createTaskForTeam(data:ICreateForTeamData){
        const task=await taskRepository.create(data)
        return task
    }
    async getMyTasks(userId: string, page: number, role: GetTasksRole, status: TaskStatuses) {
        const tasks = await taskRepository.findByUserIdPaginated(userId, page, role, status)
        return tasks
    }
    async getAllTeamsTasks(teamId:string,page:number,status:TaskStatuses){
        const tasks=await taskRepository.findByTeamIdPaginated(teamId,page,status)
        return tasks
    }
    async getFullTaskInfo(taskId:string,userId:Types.ObjectId){
        const task=await taskRepository.findById(taskId)
        const user_id=userId.toString()
        if(!task){
            throw new NotFoundError({text:'Задача не найдена'})
        }
        const isMyTask=task.createdBy.toString()===user_id||task.workedBy?.toString()===user_id
        
        if(!isMyTask){
            if(!task.teamId){
                throw new ForbiddenError({text:"Вы не можете просматривать задачи других пользователей"})
            }
            const teamMemberships=await teamMemberRepository.findByTeamId(task.teamId.toString())
            const isMyTeamsTask=teamMemberships.find(m=>m.member_id.toString()===user_id)

            if(!isMyTeamsTask){
                throw new ForbiddenError({text:"Вы не можете просматривать задачи других пользователей"})
            }
        }
        const taskComments=await taskUpdateCommentRepository.findByTaskId(taskId)
        return {task,updates:taskComments}
    }
    async updateTask(taskId: string, status: TaskStatuses, comment: string, userId: string) {
        const myTask = await taskRepository.findById(taskId)
        if (!myTask) {
            throw new NotFoundError({ text: 'Задача не найдена' })
        }
        const isMyTask = myTask.createdBy.toString() === userId || myTask.workedBy?.toString() === userId

        if (!isMyTask) {
            throw new ForbiddenError({ text: 'Вы не можете изменить чужую задачу' })
        }

        const updatedTask = await taskRepository.update(taskId, { status })
        if (!updatedTask) {
            throw new NotFoundError({ text: 'Задача была удалена' })
        }
        await updatedTask.save()
        const updatedTaskVersion: number = updatedTask.get('__v')
        const newComment = await taskUpdateCommentRepository.createComment({ updatedBy: userId, comment: comment, forVersion: updatedTaskVersion, taskId })
        return { updatedTask, newComment }
    }
}