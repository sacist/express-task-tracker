"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRoles = void 0;
const mongoose_1 = require("mongoose");
var UserRoles;
(function (UserRoles) {
    UserRoles["USER"] = "user";
    UserRoles["ADMIN"] = "admin";
})(UserRoles || (exports.UserRoles = UserRoles = {}));
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        requied: true,
        minlength: 8
    },
    role: {
        type: String,
        enum: UserRoles,
        default: UserRoles.USER
    }
}, { timestamps: true });
exports.User = (0, mongoose_1.model)('User', userSchema);
