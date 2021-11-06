import { ServerResponse } from "http";
import { Request } from "./request";

type NextMethod = (err?: unknown) => any;
export type MiddlewareHandler = (req: Request, res: ServerResponse, next: NextMethod) => void | Promise<void>;
