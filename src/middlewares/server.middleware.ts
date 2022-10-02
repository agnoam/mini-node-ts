import { Request, Response, NextFunction } from 'express';

console.log('import server.middleware');

export const ServerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('middleware of application');
    next();
}