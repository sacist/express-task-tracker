import { BaseError,IErrorsData } from "#classes/base-error";

export class ConflictError extends BaseError{
    constructor(errorsData:IErrorsData){
        super('Conflict error', errorsData)
        this.statusCode=409
    }
}