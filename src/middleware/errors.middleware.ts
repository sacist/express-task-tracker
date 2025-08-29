import { ErrorRequestHandler, Response, Request } from "express"
import { logger } from "#config/logger"

export interface AppError extends Error {
    statusCode?: number;
    code?: string | number;
    text?: string;
    data?: any;
}

export const errorsMiddleware: ErrorRequestHandler = (error: AppError, req: Request, res: Response, _) => {
    const status = error.statusCode || 500
    const code = error.code || 500
    const text = error.text || "UnexpectedError"
    const data = error.data || "No additional data"

    res.status(status).json({ code, text, data })
    logger.error(`Error in ${req.originalUrl}`, { code, text, stack: error.stack })
}