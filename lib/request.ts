import { IncomingMessage } from "http";
import { paramsToObject } from "./utils";

export interface Request extends IncomingMessage {
    params: any;
    query: any;
    body: any;
    host: any;
    ip?: string;
}

export function createRequestObject(
    req: IncomingMessage, 
    params: URLSearchParams, 
    _query: any = {}, 
    body: any = {},
    host: string,
    ip?: string,
): Request {
    const query = paramsToObject(_query);
    return Object.assign(req, { params, query, body, ip, host });
}