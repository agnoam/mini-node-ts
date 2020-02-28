import { Application, Request, Response } from "express";
import { appRouter } from './../routes/app.routes';

console.log("import routes.config");

export const RoutesConfig = (app: Application) => {
    // Define the api to where go
    app
        .use('/app', appRouter)

        .get('/', (req: Request, res: Response) => {
            res.send('node-ts server is running ;)');
        });
}
