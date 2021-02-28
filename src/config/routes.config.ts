import { Application, Request, Response } from "express";
import { userRouter } from '../components/user/user.routes';
import swaggerUi from 'swagger-ui-express';
import YAML from 'js-yaml';
import fs from 'fs';
import path from 'path';

const docPath: string = path.resolve(__dirname, '../api/swagger.yaml');
const swaggerDocument: Object = YAML.load(fs.readFileSync(docPath).toString()) as Object;

console.log("import routes.config");

export const RoutesConfig = (app: Application) => {
    // Define the api to where go
    app
        .use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
        .use('/users', userRouter)

        .get('/', (req: Request, res: Response) => {
            res.send('node-ts server is running ;)');
        });
}
