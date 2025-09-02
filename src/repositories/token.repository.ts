import { BaseRepository } from "#classes/base-repository";
import { RefreshToken, IRefreshToken } from "#modules/users/auth/tokens.model";
import { redisClient } from "#config/redis";

class TokenRepository extends BaseRepository<IRefreshToken> {
    constructor() {
        super(RefreshToken, 'token:')
    }
    async findByTokenId(token_id: string): Promise<IRefreshToken | null> {
        const key = this.getCacheKey(token_id);

        const cached = await redisClient.get(key);
        if (cached) {
            const parsed = JSON.parse(cached);
            return this.model.hydrate(parsed) as IRefreshToken;
        }

        const record = await this.model.findOne({ token_id }).exec();
        if (record) {
            await redisClient.set(key, JSON.stringify(record.toObject()));
        }

        return record;
    }
    async delete(token_id: string): Promise<IRefreshToken | null> {
        const result = await this.model.findOneAndDelete({ token_id }).exec()
        if (result) {
            await this.invalidateCache(token_id);
        }
        return result;
    }

    async update(token_id: string, data: Partial<IRefreshToken>): Promise<IRefreshToken | null> {
        const result = await this.model
            .findOneAndUpdate({ token_id }, data, { new: true, runValidators: true })
            .exec();

        if (result) {
            await this.invalidateCache(token_id);
        }

        return result;
    }
}

export const tokenRepository = new TokenRepository()