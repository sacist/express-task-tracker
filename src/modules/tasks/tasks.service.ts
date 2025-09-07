import { Types } from "mongoose";
import { TaskStatuses } from "./tasks.model";
import { GetTasksRole, taskRepository } from "#repositories/task.repository";
import { NotFoundError } from "#errors/not-found.error";
import { ForbiddenError } from "#errors/forbidden.error";
import { taskUpdateCommentRepository } from "#repositories/task-update-comment.repository";


interface ICreateTaskData {
    createdBy: Types.ObjectId
    name: string,
    status: TaskStatuses,
    description?: string,
    completeBy: Date
}

export class TasksService {
    async createTask(data: ICreateTaskData) {
        const task = await taskRepository.create(data)
        return task
    }
    async getMyTasks(userId: string, page: number, role: GetTasksRole, status: TaskStatuses) {
        const tasks = await taskRepository.findByUserIdPaginated(userId, page, role, status)
        return tasks
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