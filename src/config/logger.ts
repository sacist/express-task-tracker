import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import * as fs from 'fs'
import path from "path";

const logDir = path.join(process.cwd(), 'logs')

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir)
}
const loggerLevel = process.env.LOGGER_LVL

export const logger = winston.createLogger({
    level: loggerLevel,
    transports: [
        new DailyRotateFile({
            dirname: logDir,
            filename: 'application-errors-%DATE%.log',
            datePattern: 'DD.MM.YYYY',
            maxFiles: '30d',
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp({ format: "DD.MM.YYYY HH.mm.ss" }),
                winston.format.json(),
                winston.format.colorize()
            )
        }),
    ],

})

if (process.env.NODE_ENV === 'development') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    )
}