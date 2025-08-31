"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = void 0;
const base_error_1 = require("#classes/base-error");
class ConflictError extends base_error_1.BaseError {
    constructor(errorsData) {
        super('Conflict error', errorsData);
        this.statusCode = 409;
    }
}
exports.ConflictError = ConflictError;
