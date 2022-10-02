import apm from 'elastic-apm-node';
import { inject, injectable } from 'inversify';
import winston, { Logform } from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

import packageJSON from '../../package.json';
import { APMConfig } from './apm.config';
import { TYPES } from './di.types.config';
// import { ElasticSerachConfig } from './elasticsearch.config';

console.log('import logger.config');

@injectable()
export class LoggerConfig {  
    private _logger: winston.Logger;
    private apm: apm.Agent;

    private _defaultMetadata: IMetadata = { 
        service: process.env.LOGGER_SERVICE_NAME || packageJSON.name, 
        version: process.env.LOGGER_SERVICE_VERSION || packageJSON.version 
    }
    
    get Logger(): winston.Logger {
        return this._logger;
    }

    constructor(@inject(TYPES.APMConfig) apmConfig: APMConfig) {
        this.apm = apmConfig.apm;
    }

    initialize(configs?: ILoggerInitProps): void {
        if (!this.Logger) {
            const colorizer: Logform.Colorizer = winston.format.colorize();
            colorizer.addColors({
                info: 'cyan',
                warn: 'yellow',
                error: 'red',
                http: 'magenta',
                debug: 'orange'
            });

            // TODO: Add elasticsearch again
            // const elasticTransport: ElasticsearchTransport = new ElasticsearchTransport({
            //     indexPrefix: `${configs?.serviceName || this._defaultMetadata.service}-logs`,
            //     apm: apm,
            //     client: ElasticSerachConfig.elasticClient
            // });

            this._logger = winston.createLogger({
                level: 'http',
                format: winston.format.json(),
                defaultMeta: configs?.defaultMetadata || this._defaultMetadata,
                transports: [
                    process.env.NODE_ENV !== 'production' ?
                        new winston.transports.Console({
                            format: winston.format.combine(
                                winston.format.timestamp(),
                                winston.format.metadata({ 
                                    fillExcept: ['message', 'level', 'timestamp', 'label', 'service', 'version']
                                }),
                                winston.format.printf((info) => {
                                    const splatKey: any = Symbol.for('splat');
                                    let out: string = `${info.timestamp} ` +
                                    `[${info.service}, ${info.version}] ${info.level}: ${info.message} ` + this.formatMeta(info[splatKey]);
                                    
                                    if (info.metadata.error) {
                                        out = `${out} ${info.metadata.error}`;
                                        if (info.metadata.error.stack) {
                                            out = `${out} ${info.metadata.error.stack}`;
                                        }
                                    }

                                    return colorizer.colorize(info.level, out);
                                })
                            )
                        })
                    : undefined,
                    // elasticTransport
                ]
            });

            this.Logger.on('error', (error) => {
                console.error('Error in logger caught', error);
            });
            // elasticTransport.on('error', (error) => {
            //     console.error('Error in winston-elasticsearch caught', error);
            // });

            this.Logger.info('Logger has been created');
        }
    }

    /**
     * @description Formatting the arguments (called meta by `winston`) to human-readable string 
     * @param meta The meatadata object received from winston
     * @returns Formatted string
     */
    private formatMeta(meta: any[]): string {
        let formattedStr: string = '';

        if (!meta) return '';
        for (let i = 0; i < meta?.length; i++) {
            const variable: any = meta[i];

            if (typeof variable === 'bigint' || typeof variable === 'number' || typeof variable === 'string')
                formattedStr += `${variable}`;

            else if (typeof variable === 'symbol' || typeof variable === 'boolean')
                formattedStr += `${variable.toString()}`;

            else if (typeof variable === 'object') {
                const json: string = Object.keys(variable).length > 1 ? 
                    JSON.stringify(variable, undefined, 2) 
                : 
                    this.formatJSON(variable);

                let formattedJson: string = json.replace(/"([^"]+)":/g, '$1:');
                formattedStr += formattedJson;
            }

            if (i < meta.length - 1)
                formattedStr += ` `;
        }

        return formattedStr;
    }

    private formatJSON(obj_from_json: Object): string {
        if (typeof obj_from_json !== "object" || Array.isArray(obj_from_json)){
            // not an object, stringify using native function
            return JSON.stringify(obj_from_json);
        }
        // Implements recursive object serialization according to JSON spec
        // but without quotes around the keys.
        const props: string = Object
            .keys(obj_from_json)
            .map(key => ` ${key}: ${this.formatJSON(obj_from_json[key])} `)
            .join(",");
            
        return `{${props}}`;
    }

    private overrideConsole(): void {
        if (!this.Logger) throw 'Can not override console without an initialized logger';

        console.log = (message?: any, ...optionalParams: any[]) => this.Logger.info(message, ...optionalParams);
        console.debug = (message?: any, ...optionalParams: any[]) => this.Logger.debug(message, ...optionalParams);
        console.warn = (message?: any, ...optionalParams: any[]) => this.Logger.warn(message, ...optionalParams);
        console.error = (message?: any, ...optionalParams: any[]) => this.Logger.error(message, ...optionalParams);
    }
}

export interface ILoggerInitProps {
    serviceName?: string;
    defaultMetadata?: Object;
}

interface IMetadata {
    service: string;
    version: string;
}