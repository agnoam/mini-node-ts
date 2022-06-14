import { Application } from "express";
import { Options, Middleware } from 'oas-tools';
import * as oasTools from 'oas-tools';

import YAML from 'js-yaml';
import fs from 'fs';
import path from 'path';

import { ProbeServer } from "./probe.config";
import { Logger } from './logger.config';

const docPath: string = path.resolve(__dirname, '../api/swagger.yaml');
const swaggerDocument: Object = YAML.load(fs.readFileSync(docPath).toString()) as Object;

export const SwaggerConfig = async (app: Application): Promise<void> => {
    let options_object: Options = {
        controllers: __dirname,
        customLogger: Logger
    }

    return new Promise( (resolve, reject) => {
        const swaggerDoc = prepareSwaggerDoc(swaggerDocument);

        oasTools.configure(options_object);
        oasTools.initializeMiddleware(swaggerDoc, app, (middleware: Middleware) => {
            // Interpret Swagger resouces and attach metadata to request - must he first in swagger tools middleware chain
            app.use(middleware.swaggerMetadata());

            // Validate swagger requests
            app.use(middleware.swaggerValidator());
    
            // Route validated requests to appropriate controller
            app.use(middleware.swaggerRouter(options_object));

            ProbeServer.readyFlag = true; // Tells k8s the pod is ready
            resolve();
        });
    });
}

const prepareSwaggerDoc = (swaggerDoc: any): Object => {
    const _swaggerDocument = { ...swaggerDoc } as any;
            
    // For now overriding just host property
    // _swaggerDocument.host = process.env.SWAGGER_HOST || _swaggerDocument.host;
    
    return _swaggerDocument;
}