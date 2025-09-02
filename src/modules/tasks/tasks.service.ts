import { Types } from "mongoose";
import { TaskStatuses } from "./tasks.model";
import { GetTasksRole, taskRepository } from "#repositories/task.repository";


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
}