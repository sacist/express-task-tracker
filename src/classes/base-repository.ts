import { redisClient } from '#config/redis';
import { Document, Model, Types } from 'mongoose';

interface BaseEntity extends Document {
  _id: Types.ObjectId | unknown | string
}

export class BaseRepository<T extends BaseEntity> {
  constructor(
    public model: Model<T>,
    public cachePrefix: string
  ) {}

  protected getCacheKey(id: string): string {
    return `${this.cachePrefix}${id}`
  }

  protected async invalidateCache(id: string): Promise<void> {
    const key = this.getCacheKey(id)
    await redisClient.del(key)
  }

  async findById(id: string): Promise<T | null> {
    const key = this.getCacheKey(id)

    const cached = await redisClient.get(key)
    if (cached) {
      const parsed = JSON.parse(cached)
      return this.model.hydrate(parsed) as T
    }

    const record = await this.model.findById(id).exec();
    if (record) {
      await redisClient.set(key, JSON.stringify(record.toObject()))
    }

    return record
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const result = await this.model
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .exec()

    if (result) {
      await this.invalidateCache(id)
    }

    return result
  }

  async delete(id: string): Promise<T | null> {
    const result = await this.model.findByIdAndDelete(id).exec()
    if (result) {
      await this.invalidateCache(id)
    }
    return result
  }

  async create(data: Partial<T>): Promise<T> {
    const result = await this.model.create(data)
    return result
  }

  async invalidateCacheBulk(ids: string[]): Promise<void> {
    if (ids.length === 0) return
    const keys = ids.map(id => this.getCacheKey(id))
    await redisClient.del(keys)
  }
}