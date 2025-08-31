"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorsMiddleware = void 0;
const logger_1 = require("#config/logger");
const errorsMiddleware = (error, req, res, _) => {
    const status = error.statusCode || 500;
    const code = error.code || 500;
    const text = error.text || "UnexpectedError";
    const data = error.data || "No additional data";
    res.status(status).json({ code, text, data });
    logger_1.logger.error(`Error in ${req.originalUrl}`, { code, text });
};
exports.errorsMiddleware = errorsMiddleware;
