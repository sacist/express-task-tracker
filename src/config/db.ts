import mongoose from "mongoose";
import { logger } from "./logger";

export const connectToMongo = async () => {
    try {
        const mongoUri = process.env.MONGO_URI
        if (!mongoUri) throw new Error('.env problem')
        await mongoose.connect(mongoUri)
        logger.info('mongo запущен')
    } catch (e) {
        console.log(e)
    }
}