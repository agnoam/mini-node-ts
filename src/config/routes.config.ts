import { Application, Request, Response } from "express";
import { userRouter } from '../components/user/user.routes';

console.log("import routes.config");

export const RoutesConfig = (app: Application) => {
    // Define the api to where go
    app
        .use('/users', userRouter)

        .get('/', (req: Request, res: Response) => {
            res.send('node-ts server is running ;)');
        });
}
