import { BaseError,IErrorsData } from "#classes/base-error";

export class ValidationError extends BaseError{
    constructor(errorsData:IErrorsData){
        super('Validation error', errorsData)
        this.statusCode=400
    }
}