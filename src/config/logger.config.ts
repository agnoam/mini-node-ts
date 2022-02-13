import winston from 'winston';
import debugFormat from 'winston-format-debug';

console.log('import logger.config');

export module LoggerConfig {
    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        defaultMeta: { service: 'user-service' },
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize({ message: true }),
                    debugFormat({
                        colorizeMessage: false, // Already colored by `winston.format.colorize`.
                    })
                )
            }),
        ]
    });
}