import dotenv from "dotenv"
import path from "path"
const envFile=`.${process.env.NODE_ENV}.env`
dotenv.config({path:path.resolve(process.cwd(),envFile)})

import app from "./app"
import { connectToMongo } from "#config/db"
import { logger } from "#config/logger"
import cluster from "cluster"

if(cluster.isPrimary){
    const num=4
    for(let i=0;i<num;i++){
        cluster.fork()
    }
    cluster.on('exit',(worker,code,signal)=>{
        logger.warn(`process ${worker.id} died with a ${code} code and ${signal} signal`)
        cluster.fork()
        logger.info('new process was assigned')
    })
}else{
    
    const PORT = process.env.PORT
    
    const start=async()=>{
        await connectToMongo()
        app.listen(PORT, () => {
            logger.info(`Сервер запущен на порту ${PORT}`);
        })
    }
    start()
}
