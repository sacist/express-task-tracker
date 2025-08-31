"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const base_error_1 = require("#classes/base-error");
class ValidationError extends base_error_1.BaseError {
    constructor(errorsData) {
        super('Validation error', errorsData);
        this.statusCode = 400;
    }
}
exports.ValidationError = ValidationError;
