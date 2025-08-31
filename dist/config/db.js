"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToMongo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./logger");
const connectToMongo = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri)
            throw new Error('.env problem');
        await mongoose_1.default.connect(mongoUri);
        logger_1.logger.info('mongo запущен');
    }
    catch (e) {
        console.log(e);
    }
};
exports.connectToMongo = connectToMongo;
