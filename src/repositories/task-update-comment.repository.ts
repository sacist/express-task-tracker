import { BaseRepository } from "#classes/base-repository";
import { TaskUpdateComment, ITaskUpdateComment } from "#modules/tasks/task-update-comments.model";
import { redisClient } from "#config/redis";
import { Types } from "mongoose";

class TaskUpdateCommentRepository extends BaseRepository<ITaskUpdateComment> {
    constructor() {
        super(TaskUpdateComment, "task_update_comment:");
    }

    private async invalidateCaches(taskId: string, userId: string) {
        await Promise.all([
            redisClient.del(this.getCacheKey(`task_update_comment:task:${taskId}`)),
            redisClient.del(this.getCacheKey(`task_update_comment:user:${userId}`)),
        ]);
    }

    async findByTaskId(taskId: string) {
        const key = this.getCacheKey(`task_update_comment:task:${taskId}`);

        const cached = await redisClient.get(key);
        if (cached) {
            console.log("кэш комментариев по taskId");
            const parsed = JSON.parse(cached);
            return parsed.map((doc: any) => this.model.hydrate(doc)) as ITaskUpdateComment[];
        }

        const records = await this.model.find({ taskId }).sort({ createdAt: -1 });
        if (records.length > 0) {
            await redisClient.set(key, JSON.stringify(records.map(r => r.toObject())));
        }

        return records;
    }

    async findByUserId(userId: string) {
        const key = this.getCacheKey(`task_update_comment:user:${userId}`);

        const cached = await redisClient.get(key);
        if (cached) {
            console.log("кэш комментариев по userId");
            const parsed = JSON.parse(cached);
            return parsed.map((doc: any) => this.model.hydrate(doc)) as ITaskUpdateComment[];
        }

        const records = await this.model.find({ updatedBy: userId }).sort({ createdAt: -1 });
        if (records.length > 0) {
            await redisClient.set(key, JSON.stringify(records.map(r => r.toObject())));
        }

        return records;
    }

    async createComment(data: { updatedBy: string; taskId: string; comment: string; forVersion: number }) {
        const record = await this.model.create({
            updatedBy: new Types.ObjectId(data.updatedBy),
            taskId: new Types.ObjectId(data.taskId),
            comment: data.comment,
            forVersion: data.forVersion,
        });

        await this.invalidateCaches(data.taskId, data.updatedBy);

        return record;
    }

    async updateComment(commentId: string, data: Partial<ITaskUpdateComment>) {
        const result = await this.model.findByIdAndUpdate(commentId, data, { new: true, runValidators: true }).exec();

        if (result) {
            await this.invalidateCaches(result.taskId.toString(), result.updatedBy.toString());
        }

        return result;
    }

    async deleteComment(commentId: string) {
        const result = await this.model.findByIdAndDelete(commentId).exec();

        if (result) {
            await this.invalidateCaches(result.taskId.toString(), result.updatedBy.toString());
        }

        return result;
    }
}

export const taskUpdateCommentRepository = new TaskUpdateCommentRepository()