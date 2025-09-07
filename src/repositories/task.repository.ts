import { BaseRepository } from "#classes/base-repository"
import { Task, ITask, TaskStatuses } from "#modules/tasks/tasks.model"
import { redisClient } from "#config/redis"
import { invalidateCacheByPattern } from "#helpers/cache"

export enum GetTasksRole {
    CREATOR = 'creator',
    WORKER = 'worker'
}

class TaskRepository extends BaseRepository<ITask> {
    private tasksPerPage: number = 10

    constructor() {
        super(Task, 'task:')
    }

    private async invalidateUserTasks(userId: string): Promise<void> {
        const pattern = `${this.cachePrefix}${userId}:*`

        invalidateCacheByPattern(pattern)
    }

    async findByUserIdPaginated(
        userId: string,
        page: number = 1,
        role: GetTasksRole,
        status?: TaskStatuses
    ): Promise<ITask[]> {
        const pageKey = `:page:${page}`
        const statusKey = status ? `:status:${status}` : ''
        const roleKey = `:role:${role}`
        const key = this.getCacheKey(userId) + pageKey + statusKey + roleKey

        const cached = await redisClient.get(key)
        if (cached) {
            const parsed = JSON.parse(cached)
            return parsed.map((model: any) => this.model.hydrate(model)) as ITask[]
        }

        const filter: any =
            role === GetTasksRole.CREATOR
                ? { createdBy: userId }
                : { workedBy: userId }

        if (status) {
            filter.status = status
        }

        const records = await this.model
            .find(filter)
            .skip((page - 1) * this.tasksPerPage)
            .limit(this.tasksPerPage)
            .lean()

        if (records.length > 0) {
            await redisClient.set(key, JSON.stringify(records), { EX: 3600 })
        }

        return records as ITask[]
    }

    private async invalidateTaskUsers(task: ITask): Promise<void> {
        if (task.workedBy && task.workedBy === task.createdBy) {
            await this.invalidateUserTasks(String(task.createdBy))
        } else {
            if (task.createdBy) {
                await this.invalidateUserTasks(String(task.createdBy))
            }
            if (task.workedBy) {
                await this.invalidateUserTasks(String(task.workedBy))
            }
        }
    }

    async create(data: Partial<ITask>,): Promise<ITask> {
        const result = await this.model.create(data)
        await this.invalidateTaskUsers(result)
        return result
    }

    async update(id: string, data: Partial<ITask>): Promise<ITask | null> {
        const result = await this.model
            .findByIdAndUpdate(
                id,
                { ...data, $inc: { __v: 1 } },
                { new: true, runValidators: true }
            ).exec()
        if (result) {
            await this.invalidateTaskUsers(result)
        }

        return result
    }

    async delete(id: string): Promise<ITask | null> {
        const result = await this.model.findByIdAndDelete(id).exec()

        if (result) {
            await this.invalidateTaskUsers(result)
        }

        return result
    }
}

export const taskRepository = new TaskRepository()
