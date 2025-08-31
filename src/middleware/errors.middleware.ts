import { ErrorRequestHandler, Response, Request } from "express"
import { logger } from "#config/logger"

export interface AppError extends Error {
    statusCode?: number;
    code?: string | number;
    text?: string;
    data?: unknown;
}

export const errorsMiddleware: ErrorRequestHandler = (error: AppError, req: Request, res: Response, _) => {
    
    const status = error.statusCode || 500
    const code = error.code || error.statusCode || 500
    const text = error.text || "UnexpectedError"
    const data = error.data || "No additional data"

    res.status(status).json({ code, text, data })
    if(status>=500){
        logger.error(`Error in ${req.originalUrl}`, { code, text })
    }else{
        logger.warn(`Error in ${req.originalUrl}`, { code, text })
    }
}