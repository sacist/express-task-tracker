export interface IErrorsData{
    code?:number
    text:string
    data?:object
}
export interface IBaseError extends Error{
    code?:number,
    data:unknown,
    text:string,
    statusCode:number
}

export class BaseError extends Error implements IBaseError {

    public code
    public text
    public data
    public statusCode

	constructor(message:string, errorsData:IErrorsData) {
		super(message);
		const { code, text, data = {} } = errorsData;
		this.code = code;
		this.data = data;
		this.text = text;
		this.statusCode = 500;
	}

	toJson() {
		return JSON.stringify({
			code: this.code,
			text: this.text,
			data: this.data
		});
	}

	toObject() {
		return {
			code: this.code,
			text: this.text,
			data: this.data
		};
	}
}