import { Request, Response, NextFunction } from 'express';

console.log('import app.middleware');

export const serverMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('middleware of application');
    next();
}