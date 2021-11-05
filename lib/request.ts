import { IncomingMessage } from "http";

export interface Request extends IncomingMessage {
    params: any;
    query: any;
    body: any;
}

export function createRequestObject(
    req: IncomingMessage, 
    params: any = {}, 
    query: any = {}, 
    body: any = {}
): Request {
    return Object.assign(req, { params, query, body });
}