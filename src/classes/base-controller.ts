import { ValidationError } from "#errors/validation.error"
import { Request, Response, NextFunction } from "express"
import { ZodTypeAny,ZodError } from "zod"

type ValidationSchemas = {
    body?: ZodTypeAny
    query?: ZodTypeAny
    params?: ZodTypeAny
}

export abstract class BaseController {
    protected run = (
        schemas: ValidationSchemas,
        handler: (req: Request, res: Response, next: NextFunction) => Promise<any>
    ) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                if (schemas.body) req.body = schemas.body.parse(req.body)
                if (schemas.query) req.query = schemas.query.parse(req.query) as any
                if (schemas.params) req.params = schemas.params.parse(req.params) as any

                const result = await handler(req, res, next)
                res.json({ success: true, data: result })
            } catch (err) {
                if(err instanceof ZodError){
                    next(new ValidationError({text:"Ошибка валидации",code:400,data:err.issues}))
                }
                next(err)
            }
        }
    }
}
