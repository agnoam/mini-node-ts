import { Application, Request, Response, NextFunction } from "express";
import swaggerTools, { SwaggerRouter20Options } from 'swagger-tools';

import YAML from 'js-yaml';
import fs from 'fs';
import path from 'path';

import { ProbeServer } from "./probe.config";
import { ResponseStatus } from "../utils/consts";

const docPath: string = path.resolve(__dirname, '../api/swagger.yaml');
const swaggerDocument: Object = YAML.load(fs.readFileSync(docPath).toString()) as Object;

export const SwaggerConfig = async (app: Application): Promise<void> => {
    const options: SwaggerRouter20Options = {
        controllers: __dirname,
        // loglevel: 'debug',
        // strict: 'true',
        useStubs: process.env.NODE_ENV === 'development', // Conditionally turn on stubs (mock mode)
    }

    const swaggerDoc = prepareSwaggerDoc(swaggerDocument);
    return new Promise( (resolve, reject) => {
        swaggerTools.initializeMiddleware(swaggerDoc, (middleware) => {
            // Interpret Swagger resouces and attach metadata to  request - must he first in swagger tools middleware chain
            app.use(middleware.swaggerMetadata());
            // app.use(morgan('combined'));
    
            // validate swagger requests
            app.use(middleware.swaggerValidator());
    
            // CORS!!! and OPTIONS handler
            // app.use((req, res, next) => {
            //     res.setHeader('Access-Control-Allow-Origin', '*');
            //     res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            //     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, UseCamelCase, x-clientid, Authorization');
    
            //     if (req.method === 'OPTIONS') {
            //         res.statusCode = 200;
            //         res.end();
            //     } else {
            //         next();
            //     }
            // });

            app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
                if (err) {
                    res.status(ResponseStatus.BadRequest).json({ description: 'Internal error' });
                } else {
                    next();
                }
            });
    
            // Route validated requests to appropriate controller
            app.use(middleware.swaggerRouter(options));
    
            // Serve the swagger documents and swagger ui
            app.use(
                middleware.swaggerUi({
                    // apiDocs: `${parsedURL.path}${serviceData.name}/api-docs`,
                    swaggerUi: '/docs'
                })
            );
    
            // Start the server
            // await probe.start(app, serverPort);
            ProbeServer.readyFlag = true;
            // logger.log('info', `your server is listening on port ${serverPort} http://${swaggerDoc.host}`);
            // logger.log('info', `Swagger-ui is available on http://${swaggerDoc.host}/docs`);
            resolve();
        });
    });
}

const prepareSwaggerDoc = (swaggerDoc: any): Object => {
    const _swaggerDocument = { ...swaggerDoc } as any;
            
    // For now overriding just host property
    _swaggerDocument.host = process.env.SWAGGER_HOST || _swaggerDocument.host;
    
    return _swaggerDocument;
}