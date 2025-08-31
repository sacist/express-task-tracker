import express, { json, Request, Response } from "express";
import { errorsMiddleware } from "#middleware/errors.middleware";
import usersRouter from "#modules/users/users.router";
import authRouter from "#modules/users/auth/auth.router";

const app = express()

app.use(json())

app.use('/users',usersRouter)
app.use('/auth',authRouter)

app.use('/ping', (req: Request, res: Response, next) => {
    try {
        throw new Error('random error')
    } catch (err) {
        next(err)
    }
});

app.use(errorsMiddleware)

export default app