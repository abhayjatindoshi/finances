import { Response, } from "express";

export enum ApiErrorCode {
    FIELD_MISSING,
    INTERNAL_ERROR,
    INVALID_DATA,
    UNAUTHORIZED,
    NOT_ALLOWED,
}

export default class ApiError extends Error {

    private statusCode: number;
    code: ApiErrorCode;
    cause: Error | undefined;

    constructor();
    constructor(statusCode: number, code: ApiErrorCode);
    constructor(statusCode: number, code: ApiErrorCode, message?: string);
    constructor(statusCode: number = 500,
        code: ApiErrorCode = ApiErrorCode.INTERNAL_ERROR,
        message: string = "Something went wrong. It\'s not you, probably us.",
        cause?: Error) {
        super();
        this.message = message;
        this.cause = cause;
        this.statusCode = statusCode;
        this.code = code;
    }

    static message(message: string): ApiError {
        let apiError = new ApiError();
        apiError.message = message;
        return apiError;
    }

    respond(res: Response): Response {
        return res.status(this.statusCode)
            .json({ code: ApiErrorCode[this.code], message: this.message });
    }
}