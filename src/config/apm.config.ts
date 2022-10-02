// import winston from 'winston';
import { /* inject, */ injectable } from 'inversify';
import apm_instance, { Agent } from 'elastic-apm-node';

// import { LoggerConfig } from '../config/logger.config';
import packageJSON from '../../package.json';
// import { TYPES } from './di.types.config';

console.log('import apm.config');

@injectable()
export class APMConfig {
    // private Logger: winston.Logger;
    apm: Agent;

    // constructor(@inject(TYPES.LoggerConfig) loggerConfig: LoggerConfig) {
    //     this.Logger = loggerConfig.Logger;
    // }

    public initializeAPM(): void {  
        console.log('Trying to start APM agent');
        
        if (!apm_instance.isStarted()) {
            console.log('Starting apm agent');
            this.apm = apm_instance.start({
                frameworkVersion: process.version,
                serviceName: process.env.ELASTIC_APM_SERVICE_NAME || packageJSON.name,
                serviceVersion: packageJSON.version,
                serverUrl: process.env.ELASTIC_APM_SERVER_URL || 'http://localhost:8200',
                environment: process.env.NODE_ENV || 'Development'
            });
        }
    
        if (!this.apm) {
            console.error('Agent already running');
            this.apm = apm_instance;
        }
    }
}