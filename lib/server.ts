import http from 'http';
import { NotFoundException, BaseError } from './errors';
import { EndpointHandler, ErrorHandler } from './http';
import { HttpOptions } from './options';
import { createRequestObject } from './request';
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

        const params = (endpoint.match(url.pathname) as any).params;
        const query = url.searchParams;
        const body = {};
        const request = createRequestObject(req, params, query, body);

        try {
            for (const middlewareFn of middlewares) {
                let err: unknown;
                
                function next(_err?: unknown) {
                    err = _err;
                }
    
                await middlewareFn(request, res, next);
                if (res.writableEnded) {
                    return;
                }

                if (err && !res.writableEnded) {
                    throw err;
                }
            }

            const result = await endpoint.handler(request, res);
            
            if (typeof result === 'string' && !res.writableEnded) {
                res.setHeader('Content-Type', 'text/html');
                return res.end(result);
            }

            if (typeof result === 'object' && !res.writableEnded) {
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify(result));
            }
        }

        catch (err) {
            const errBody = buildError(err);
            res.statusCode = errBody.statusCode;

            if (!errorHandler) {
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify(errBody));
            }

            const result = errorHandler(err, request, res);
            
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
    })
}