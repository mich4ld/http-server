import http, { ServerResponse } from 'http';
import { NotFoundException, BaseError } from './errors';
import { EndpointHandler, ErrorHandler } from './http';
import { HttpOptions } from './options';
import { formParser, jsonParser } from './parsers';
import { createRequestObject, Request } from './request';
import { MiddlewareHandler } from './types';

function buildError(err: unknown) {
    const isHttpError = err instanceof BaseError && err.statusCode;

    return {
        message: isHttpError ? err.message : 'Server Error',
        statusCode: isHttpError ? err.statusCode : 500,
    }
}

export enum Methods {
    GET = 'GET',
    POST = 'POST',
    DELETE = 'DELETE',
    PUT = 'PUT',
    PATCH = 'PATCH',
    HEAD = 'HEAD',
    OPTIONS = 'OPTIONS',
}

export const WRITABLE_METHODS = [Methods.PATCH, Methods.POST, Methods.PUT];

async function handleRequest(
    req: Request, 
    res: ServerResponse, 
    middlewares: MiddlewareHandler[], 
    endpoint: EndpointHandler, 
    errorHandler?: ErrorHandler,
) {
    try {
        await handleMiddlewares(req, res, middlewares);
        if (res.writableEnded) {
            return;
        }

        await handleEndpoint(req, res, endpoint);
    }

    catch (err) {
        const errBody = buildError(err);
        res.statusCode = errBody.statusCode;

        if (!errorHandler) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(errBody));
        }

        const result = errorHandler(err, req, res);
        
        if (result instanceof Promise) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(errBody));
        }

        if (typeof result === 'string' && !res.writableEnded) {
            res.setHeader('Content-Type', 'text/html');
            return res.end(result);
        }

        if (typeof result === 'object' && !res.writableEnded) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(result));
        }
    }
}

async function handleMiddlewares(req: Request, res: ServerResponse, middlewares: MiddlewareHandler[]) {
    for (const middlewareFn of middlewares) {
        let err: unknown;
        
        function next(_err?: unknown) {
            err = _err;
        }

        await middlewareFn(req, res, next);
        if (res.writableEnded) {
            return;
        }

        if (err && !res.writableEnded) {
            throw err;
        }
    }
}

async function handleEndpoint(req: Request, res: ServerResponse, endpoint: EndpointHandler) {
    const result = await endpoint.handler(req, res);
            
    if (typeof result === 'string' && !res.writableEnded) {
        res.setHeader('Content-Type', 'text/html');
        return res.end(result);
    }

    if (typeof result === 'object' && !res.writableEnded) {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(result));
    }
}

export function createServer(
    port: number | string,
    options: HttpOptions, 
    middlewares: MiddlewareHandler[],
    handlers: EndpointHandler[],
    errorHandler?: ErrorHandler,
) {
    return http.createServer(async (req, res) => {
        const method = req.method || Methods.GET;
        const reqUrl = req.url || '/';
        const url = new URL(reqUrl, `http://${req.headers.host || 'localhost:'+port}`);
        
        const endpoint = handlers.find(_endpoint => _endpoint.match(url.pathname) && _endpoint.method === method);
        if (!endpoint) {
            const err = new NotFoundException(`Path ${url.pathname} not found`);
            const errBody = buildError(err);
            res.statusCode = errBody.statusCode;
        
            return res.end(JSON.stringify(errBody))
        }

        if (WRITABLE_METHODS.includes(method as Methods)) {
            const contentType = req.headers['content-type'] || 'application/x-www-form-urlencoded';
            const chunks: Buffer[] = [];
            let bytes = 0;

            req.on('data', (chunk: Buffer | string) => {
                if (typeof chunk === 'string') {
                    chunk = Buffer.from(chunk);
                }

                bytes += chunk.byteLength
                chunks.push(chunk);
            });

            req.on('end', async () => {
                const buffer = chunks.concat();
                const params = (endpoint.match(url.pathname) as any).params;
                const query = url.searchParams;
                let body = {}

                if (contentType === 'application/json') {
                    body = jsonParser(buffer);
                }

                if (contentType === 'application/x-www-form-urlencoded') {
                    body = formParser(buffer);
                }

                const request = createRequestObject(req, params, query, body);
                await handleRequest(request, res, middlewares, endpoint, errorHandler);
            });

            return;
        }

        const params = (endpoint.match(url.pathname) as any).params;
        const query = url.searchParams;
        const body = {};
        const request = createRequestObject(req, params, query, body);

        await handleRequest(request, res, middlewares, endpoint, errorHandler);
        
    })
}