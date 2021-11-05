import { ServerResponse } from 'http';
import { Request } from './request';

export type HttpHandler = (req: Request, res: ServerResponse) => any;

export interface HttpOptions {
    cors?: boolean;
    trustProxy?: boolean;
}

export const defaultOptions: HttpOptions = {
    cors: false,
    trustProxy: false
}
