import { Application } from "express";
import * as oasTools from '@oas-tools/core';

import YAML from 'js-yaml';
import fs from 'fs';
import path from 'path';

const docPath: string = path.resolve(__dirname, '../api/swagger.yaml');
const swaggerDocument: Object = YAML.load(fs.readFileSync(docPath).toString()) as Object;

export const SwaggerConfig = async (app: Application): Promise<void> => {
    try {
        const config: oasTools.Options = {
            oasFile: docPath,
            middleware: {
                router: {
                    controllers: path.resolve(__dirname)
                }
            }
        }
        await oasTools.initialize(app, config);
    } catch (ex) {
        console.error('SwaggerConfig() ex:', ex);
    }
}

const prepareSwaggerDoc = (swaggerDoc: any): Object => {
    const _swaggerDocument = { ...swaggerDoc } as any;
            
    // For now overriding just host property
    // _swaggerDocument.host = process.env.SWAGGER_HOST || _swaggerDocument.host;
    
    return _swaggerDocument;
}