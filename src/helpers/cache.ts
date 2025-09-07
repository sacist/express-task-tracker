import { redisClient } from "#config/redis"

export const invalidateCacheByPattern = async (pattern: string):Promise<void> => {
    try {
        let cursor = '0'
        do {
            const reply = await redisClient.scan(cursor, {
                MATCH: pattern,
                COUNT: 100
            })
    
            cursor = reply.cursor
            const keys = reply.keys
    
            if (keys.length > 0) {
                await redisClient.del(keys)
            }
        } while (cursor !== '0')
    } catch (e) {
        throw new Error('Ошибка при очистке кэша по паттерну')
    }
}