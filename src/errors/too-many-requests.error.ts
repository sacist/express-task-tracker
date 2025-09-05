import { BaseError,IErrorsData } from "#classes/base-error";

export class TooManyRequestsError extends BaseError{
    constructor(errorsData:IErrorsData){
        super('Too many requests', errorsData)
        this.statusCode=429
    }
}