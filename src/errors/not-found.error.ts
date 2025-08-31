import { BaseError,IErrorsData } from "#classes/base-error";

export class NotFoundError extends BaseError{
    constructor(errorsData:IErrorsData){
        super('NotFound error', errorsData)
        this.statusCode=404
    }
}