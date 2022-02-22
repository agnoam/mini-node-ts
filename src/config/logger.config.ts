import winston, { Logform } from 'winston';
// import { ElasticsearchTransport } from 'winston-elasticsearch';
// import { ElasticSerachConfig } from './elasticsearch.config';

console.log('import logger.config');

export let Logger: winston.Logger;

export module LoggerConfig {   
    export const initialize = (configs?: ILoggerInitProps): void => {
        if (!Logger) {
            const colorizer: Logform.Colorizer = winston.format.colorize();
            colorizer.addColors({
                info: 'cyan',
                warn: 'yellow',
                error: 'red',
                http: 'magenta',
                debug: 'orange'
            });

            Logger = winston.createLogger({
                level: 'http',
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
                                    const splatKey: any = Symbol.for('splat');
                                    let out: string = `${info.timestamp} ` +
                                    `[${info.service}, ${info.version}] ${info.level}: ${info.message} ` + formatMeta(info[splatKey]);
                                    
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

    /**
     * @description Formatting the arguments (called meta by `winston`) to human-readable string 
     * @param meta The meatadata object received from winston
     * @returns Formatted string
     */
    const formatMeta = (meta: any[]): string => {
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
                    formatJSON(variable);

                let formattedJson: string = json.replace(/"([^"]+)":/g, '$1:');
                formattedStr += formattedJson;
            }

            if (i < meta.length - 1)
                formattedStr += ` `;
        }

        return formattedStr;
    }

    function formatJSON(obj_from_json: Object): string {
        if (typeof obj_from_json !== "object" || Array.isArray(obj_from_json)){
            // not an object, stringify using native function
            return JSON.stringify(obj_from_json);
        }
        // Implements recursive object serialization according to JSON spec
        // but without quotes around the keys.
        const props: string = Object
            .keys(obj_from_json)
            .map(key => ` ${key}: ${formatJSON(obj_from_json[key])} `)
            .join(",");
            
        return `{${props}}`;
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