"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseError = void 0;
class BaseError extends Error {
    constructor(message, errorsData) {
        super(message);
        const { code, text, data = {} } = errorsData;
        this.code = code;
        this.data = data;
        this.text = text;
        this.statusCode = 500;
    }
    toJson() {
        return JSON.stringify({
            code: this.code,
            text: this.text,
            data: this.data
        });
    }
    toObject() {
        return {
            code: this.code,
            text: this.text,
            data: this.data
        };
    }
}
exports.BaseError = BaseError;
