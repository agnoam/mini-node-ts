import winston from 'winston';
import debugFormat from 'winston-format-debug';
// import { ElasticsearchTransport } from 'winston-elasticsearch';
// import { ElasticSerachConfig } from './elasticsearch.config';

console.log('import logger.config');

export let Logger: winston.Logger;

export module LoggerConfig {   
    export const initialize = (configs?: ILoggerInitProps): void => {
        if (!Logger) {
            Logger = winston.createLogger({
                level: 'info',
                format: winston.format.json(),
                defaultMeta: configs?.defaultMetadata || { service: 'non-set-service-name', version: '-1.0.0' },
                transports: [
                    // process.env.NODE_ENV !== 'production' ?
                    new winston.transports.Console({
                        format: winston.format.combine(
                            winston.format.timestamp(),
                            winston.format.colorize({ message: true, all: true }),
                            winston.format.printf((info: any) => `${info.timestamp} - ${info.level}: ${info.message}` + ` ${info?.args || ''}`)
                        )
                    })
                    // : undefined,
                    // new ElasticsearchTransport({
                    //     indexPrefix: `${configs.serviceName}-logs`,
                    //     client: ElasticSerachConfig.elasticClient
                    // })
                ]
            });

            console.log('Logger has been created');
            // overrideConsole();
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