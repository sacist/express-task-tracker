"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const controller = new users_controller_1.UsersController();
const usersRouter = (0, express_1.Router)();
usersRouter.post('/', controller.createUser);
exports.default = usersRouter;
