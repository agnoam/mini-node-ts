import { Request, Response, NextFunction } from 'express';

import { ResponseStatus } from "../utils/consts";

const ErrorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    err ? 
        res.status(ResponseStatus.BadRequest).json({ description: 'Internal error' }) 
    : next();
}

export default ErrorMiddleware;