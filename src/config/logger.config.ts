import winston, { Logger } from 'winston';
import debugFormat from 'winston-format-debug';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { ElasticSerachConfig } from './elasticsearch.config';

console.log('import logger.config');

export module LoggerConfig {
    export let logger: Logger;
    
    export const initialize = (configs?: ILoggerInitProps): void => {
        if (!logger) {
            logger = winston.createLogger({
                level: 'info',
                format: winston.format.json(),
                defaultMeta: configs?.defaultMetadata || { service: 'non-set-service-name', version: '-1.0.0' },
                transports: [
                    // process.env.NODE_ENV !== 'production' ?
                        new winston.transports.Console({
                            format: winston.format.combine(
                                winston.format.timestamp(),
                                winston.format.colorize({ message: true }),
                                // winston.format.printf((info) => {

                                // })
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
        if (!logger) throw 'Can not override console without an initialized logger';

        console.log = (message?: any, ...optionalParams: any[]) => logger.info(message, ...optionalParams);
        console.debug = (message?: any, ...optionalParams: any[]) => logger.debug(message, ...optionalParams);
        console.warn = (message?: any, ...optionalParams: any[]) => logger.warn(message, ...optionalParams);
        console.error = (message?: any, ...optionalParams: any[]) => logger.error(message, ...optionalParams);
    }
}

export interface ILoggerInitProps {
    serviceName?: string;
    defaultMetadata?: Object;
}