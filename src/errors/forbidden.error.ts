import { BaseError,IErrorsData } from "#classes/base-error";

export class ForbiddenError extends BaseError{
    constructor(errorsData:IErrorsData){
        super('Forbidden error', errorsData)
        this.statusCode=403
    }
}