import { BaseError,IErrorsData } from "#classes/base-error";

export class UnauthorizedError extends BaseError{
    constructor(errorsData:IErrorsData){
        super('Unauthorized error', errorsData)
        this.statusCode=401
    }
}