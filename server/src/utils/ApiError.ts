export class ApiError extends Error {
    statusCode: number;
    success: boolean;
    errors: string[] | object[];
    data: null;

    constructor(
        statusCode: number,
        message: string = "Something went wrong",
        errors: string[] | object[] = [],
        stack: string = ""
    ) {
        super(message);

        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        this.success = false;
        this.data = null;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
