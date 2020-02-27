import { Application, Request, Response } from 'express';

console.log('import app.middleware');

module.exports = (app: Application) => {
    app.use((req: Request, res: Response, next) => {        
        console.log('middleware of application');

        next();
    });
}