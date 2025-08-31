"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const conflict_error_1 = require("#errors/conflict.error");
const users_model_1 = require("./users.model");
const bcrypt = __importStar(require("bcrypt"));
class UsersService {
    async createUser(data) {
        try {
            let role;
            if (data.passcode && data.passcode === 'Wanna_be_admin') {
                role = users_model_1.UserRoles.ADMIN;
            }
            else {
                role = users_model_1.UserRoles.USER;
            }
            const hashedPwd = await bcrypt.hash(data.password, 10);
            const user = new users_model_1.User({
                ...data,
                password: hashedPwd,
                role
            });
            await user.save();
            return user;
        }
        catch (e) {
            const err = e;
            if (err.code === 11000) {
                throw new conflict_error_1.ConflictError({ text: "Данный email уже зарегестрирован", code: err.code, data: { email: data.email } });
            }
            throw e;
        }
    }
}
exports.UsersService = UsersService;
