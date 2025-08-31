"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const base_controller_1 = require("#classes/base-controller");
const users_service_1 = require("./users.service");
const zod_1 = __importDefault(require("zod"));
class UsersController extends base_controller_1.BaseController {
    constructor() {
        super();
        this.usersService = new users_service_1.UsersService();
        this.createUser = this.run({
            body: zod_1.default.object({
                email: zod_1.default.email(),
                password: zod_1.default.string().min(8),
                name: zod_1.default.string(),
                passcode: zod_1.default.string().optional()
            })
        }, async (req) => {
            const user = await this.usersService.createUser(req.body);
            return { message: 'Юзер создан', user };
        });
    }
}
exports.UsersController = UsersController;
