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

    private async invalidateTaskRelations(task: ITask): Promise<void> {
        const keysToInvalidate: string[] = []

        if (task.createdBy) keysToInvalidate.push(this.getCacheKey(String(task.createdBy)))
        if (task.workedBy) keysToInvalidate.push(this.getCacheKey(String(task.workedBy)))
        if (task.teamId) keysToInvalidate.push(this.getCacheKey(String(task.teamId)))

        for (const baseKey of keysToInvalidate) {
            await invalidateCacheByPattern(`${baseKey}:*`)
        }
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
            console.log('Сработл кэш по фильтру:', key);
            
            const parsed = JSON.parse(cached)
            return parsed.map((model: any) => this.model.hydrate(model)) as ITask[]
        }

        const filter: any =
            role === GetTasksRole.CREATOR
                ? { createdBy: userId }
                : { workedBy: userId }

        if (status) filter.status = status

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

    async findByTeamIdPaginated(
        teamId: string,
        page: number = 1,
        status?: TaskStatuses
    ): Promise<ITask[]> {
        const pageKey = `:page:${page}`
        const statusKey = status ? `:status:${status}` : ''
        const key = this.getCacheKey(teamId) + pageKey + statusKey

        const cached = await redisClient.get(key)
        if (cached) {
            console.log('Сработл кэш по фильтру:', key);
            const parsed = JSON.parse(cached)
            return parsed.map((model: any) => this.model.hydrate(model)) as ITask[]
        }

        const filter: any = { teamId }
        if (status) filter.status = status

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

    async create(data: Partial<ITask>): Promise<ITask> {
        const task = await this.model.create(data)
        await this.invalidateTaskRelations(task)
        return task
    }

    async update(id: string, data: Partial<ITask>): Promise<ITask | null> {
        const updatedTask = await this.model
            .findByIdAndUpdate(
                id,
                { ...data, $inc: { __v: 1 } },
                { new: true, runValidators: true }
            )
            .exec()

        if (updatedTask) {
            await this.invalidateTaskRelations(updatedTask)
        }

        return updatedTask
    }

    async delete(id: string): Promise<ITask | null> {
        const task = await this.model.findByIdAndDelete(id).exec()

        if (task) {
            await this.invalidateTaskRelations(task)
        }

        return task
    }
}

export const taskRepository = new TaskRepository()
