import { HttpHandler, HttpOptions, defaultOptions } from './options';
import { createServer, Methods } from './server';
import { match, MatchFunction } from 'path-to-regexp';
import { Request } from './request';
import { ServerResponse } from 'http';
import { MiddlewareHandler } from './types';

import cors from 'cors';

export interface EndpointHandler {
    match: MatchFunction;
    method: Methods;
    handler: HttpHandler;
    path: string;
}

export type ErrorHandler = (err: unknown, req: Request, res: ServerResponse) => any;

export class Http {
    private settings: HttpOptions;
    private middlewares: MiddlewareHandler[] = [];
    private handlers: EndpointHandler[] = [];
    private errorHandler?: ErrorHandler;

    constructor(settings: HttpOptions = defaultOptions) {
        this.settings = settings;
    }

    private addHandler(method: Methods, path: string, handler: HttpHandler) {
        const endpointHandler: EndpointHandler = {
            match: match(path),
            path,
            handler,
            method,
        }

        this.handlers.push(endpointHandler);
    }

    use(handler: MiddlewareHandler) {
        this.middlewares.push(handler);
    }

    get(path: string, handler: HttpHandler) {
        this.addHandler(Methods.GET, path, handler);
    }

    delete(path: string, handler: HttpHandler) {
        this.addHandler(Methods.DELETE, path, handler);
    }

    post(path: string, handler: HttpHandler) {
        this.addHandler(Methods.POST, path, handler);
    }

    put(path: string, handler: HttpHandler) {
        this.addHandler(Methods.PUT, path, handler);
    }

    path(path: string, handler: HttpHandler) {
        this.addHandler(Methods.PATCH, path, handler);
    }

    head(path: string, handler: HttpHandler) {
        this.addHandler(Methods.HEAD, path, handler);
    }

    options(path: string, handler: HttpHandler) {
        this.addHandler(Methods.OPTIONS, path, handler);
    }

    error(handler: ErrorHandler) {
        this.errorHandler = handler;
    }

    listen(port: number | string, cb?: (port: number | string) => any) {
        if (this.settings.cors) {
            this.use(cors());
        }

        const server = createServer(
            port, 
            this.settings, 
            this.middlewares, 
            this.handlers,
            this.errorHandler,
        );
        server.listen(port);
        if (cb) cb(port);
    }
}