import dotenv from "dotenv"
import app from "./app"
import { connectToMongo } from "#config/db"
import path from "path"
import { logger } from "#config/logger"

const envFile=`.${process.env.NODE_ENV}.env`

dotenv.config({path:path.resolve(process.cwd(),envFile)})

const PORT = process.env.PORT

const start=async()=>{
    await connectToMongo()
    app.listen(PORT, () => {
        logger.info(`Сервер запущен на порту ${PORT}`);
    })
}

start()