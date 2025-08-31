"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("#config/db");
const path_1 = __importDefault(require("path"));
const logger_1 = require("#config/logger");
const envFile = `.${process.env.NODE_ENV}.env`;
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), envFile) });
const PORT = process.env.PORT;
const start = async () => {
    await (0, db_1.connectToMongo)();
    app_1.default.listen(PORT, () => {
        logger_1.logger.info(`Сервер запущен на порту ${PORT}`);
    });
};
start();
