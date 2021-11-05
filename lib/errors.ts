export class BaseError extends Error {
    statusCode: number = 500;

    constructor(message?: string) {
        super(message);
    }
}

export class BadRequestException extends BaseError {
    statusCode: number = 400;
    message: string = 'Bad Request';
}

export class NotFoundException extends BaseError {
    statusCode: number = 404;
    message: string = 'Adress not found';
}

export class UnauthorizedException extends BaseError {
    statusCode: number = 401;
    message: string = 'Authorization is required';
}

export class ForbiddenException extends BaseError {
    statusCode: number = 403;
    message: string = 'Forbidden';
}

export class MethodNotAllowedException extends BaseError {
    statusCode: number = 405;
    message: string = 'Method not allowed';
}

export class RequestTimeoutException extends BaseError {
    statusCode: number = 408;
    message: string = 'Request Timeout';
}

export class NotAcceptableException extends BaseError {
    statusCode: number = 406;
    message: string = 'Not Acceptable';
}

export class ConflictException extends BaseError {
    statusCode: number = 409;
    message: string = 'Conflict';
}

export class TooManyRequestsException extends BaseError {
    statusCode: number = 429;
    message: string = 'Too many requests';
}

export class BadGatewayException extends BaseError {
    statusCode: number = 502;
    message: string = 'Bad Gateway';
}

export class ServiceUnavailableException extends BaseError {
    statusCode: number = 503;
    message: string = 'Service unavailable';
}

export class GatewayTimeoutException extends BaseError {
    statusCode: number = 504;
    message: string = 'Gateway timeout';
}

export class NotImplementedException extends BaseError {
    statusCode: number = 501;
    message: string = 'Not implemented';
}
