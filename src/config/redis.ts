import {createClient} from 'redis'
import { logger } from './logger';

export const redisClient=createClient({
    url:process.env.REDIS_URL
})

redisClient.on('connect',()=>{
    logger.info('Redis подключен');
})