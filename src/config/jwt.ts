import { SignOptions } from "jsonwebtoken"

interface IJwtConf{
    secret:string,
    options:SignOptions
}

export const jwtRefreshConf:IJwtConf={
    secret:process.env.JWT_SECRET_REFRESH as string,
    options:{
        expiresIn:'30d'
    }
}

export const jwtAccessConf:IJwtConf={
    secret:process.env.JWT_SECRET_ACCESS as string,
    options:{
        expiresIn:'1m'
    }
}