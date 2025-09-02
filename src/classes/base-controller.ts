import { Request, Response, NextFunction } from "express"
import { ZodTypeAny, ZodError } from "zod"
import { ValidationError } from "#errors/validation.error"
import { IRequestWithUser } from "#middleware/auth.middleware"

type ValidationSchemas = {
    body?: ZodTypeAny
    query?: ZodTypeAny
    params?: ZodTypeAny
}

export interface IValidatedRequest extends IRequestWithUser {
    validatedBody?: any
    validatedQuery?: any
    validatedParams?: any
}

type RunRequest = Request | IValidatedRequest

export abstract class BaseController {
    protected run = <T extends RunRequest = IValidatedRequest> (
        schemas: ValidationSchemas | null,
        handler: (req: T, res: Response, next: NextFunction) => any | Promise<any>
    ) => {
        return async (req: T, res: Response, next: NextFunction) => {
            try {
                if (schemas) {
                    if (schemas.body) (req as IValidatedRequest).validatedBody = schemas.body.parse(req.body)
                    if (schemas.query) (req as IValidatedRequest).validatedQuery = schemas.query.parse(req.query)
                    if (schemas.params) (req as IValidatedRequest).validatedParams = schemas.params.parse(req.params)
                }

                const result = await handler(req, res, next)
                res.json({ success: true, data: result })
            } catch (err) {
                if (err instanceof ZodError) {
                    next(new ValidationError({ text: "Ошибка валидации", code: 400, data: err.issues }))
                    return
                }
                next(err)
            }
        }
    }
}
