"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const validation_error_1 = require("#errors/validation.error");
const zod_1 = require("zod");
class BaseController {
    constructor() {
        this.run = (schemas, handler) => {
            return async (req, res, next) => {
                try {
                    if (schemas.body)
                        req.body = schemas.body.parse(req.body);
                    if (schemas.query)
                        req.query = schemas.query.parse(req.query);
                    if (schemas.params)
                        req.params = schemas.params.parse(req.params);
                    const result = await handler(req, res, next);
                    res.json({ success: true, data: result });
                }
                catch (err) {
                    if (err instanceof zod_1.ZodError) {
                        next(new validation_error_1.ValidationError({ text: "Ошибка валидации", code: 400, data: err.issues }));
                    }
                    next(err);
                }
            };
        };
    }
}
exports.BaseController = BaseController;
