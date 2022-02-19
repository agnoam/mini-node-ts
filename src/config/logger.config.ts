import { logger } from 'elastic-apm-node';
import winston, { Logform } from 'winston';
import debugFormat from 'winston-format-debug';
// import { ElasticsearchTransport } from 'winston-elasticsearch';
// import { ElasticSerachConfig } from './elasticsearch.config';

console.log('import logger.config');

export let Logger: winston.Logger;

export module LoggerConfig {   
    export const initialize = (configs?: ILoggerInitProps): void => {
        if (!Logger) {
            const colorizer: Logform.Colorizer = winston.format.colorize();
            Logger = winston.createLogger({
                level: 'info',
                format: winston.format.json(),
                defaultMeta: configs?.defaultMetadata || { service: 'non-set-service-name', version: '-1.0.0' },
                transports: [
                    process.env.NODE_ENV !== 'production' ?
                        new winston.transports.Console({
                            format: winston.format.combine(
                                winston.format.timestamp(),
                                winston.format.metadata({ 
                                    fillExcept: ['message', 'level', 'timestamp', 'label', 'service', 'version'] 
                                }),
                                winston.format.printf((info) => {
                                    let out: string = `${info.timestamp} [${info.service}, ` +
                                    `${info.version}] ${info.level}: ${info.message} ` + 
                                    `${Object.keys(info.metadata) ? JSON.stringify(info.metadata) : ''}`;
                                    
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
                    // new ElasticsearchTransport({
                    //     indexPrefix: `${configs.serviceName}-logs`,
                    //     client: ElasticSerachConfig.elasticClient
                    // })
                ]
            });

            // overrideConsole();
            Logger.info('Logger has been created');
        }
    }

    const overrideConsole = () => {
        if (!Logger) throw 'Can not override console without an initialized logger';

        console.log = (message?: any, ...optionalParams: any[]) => Logger.info(message, ...optionalParams);
        console.debug = (message?: any, ...optionalParams: any[]) => Logger.debug(message, ...optionalParams);
        console.warn = (message?: any, ...optionalParams: any[]) => Logger.warn(message, ...optionalParams);
        console.error = (message?: any, ...optionalParams: any[]) => Logger.error(message, ...optionalParams);
    }
}

export interface ILoggerInitProps {
    serviceName?: string;
    defaultMetadata?: Object;
}