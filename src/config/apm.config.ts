import apm_instance, { Agent } from 'elastic-apm-node';
import { Logger } from '../config/logger.config';
import packageJSON from '../../package.json';

console.log('import apm.config');

export let apm: Agent;
export module APMConfig {
    export const initializeAPM = (): void => {  
        Logger.info('Trying to start APM agent');
        
        if (!apm_instance.isStarted()) {
            Logger.info('Starting apm agent');
            apm = apm_instance.start({
                frameworkVersion: process.version,
                serviceName: process.env.ELASTIC_APM_SERVICE_NAME || packageJSON.name,
                serviceVersion: packageJSON.version,
                serverUrl: process.env.ELASTIC_APM_SERVER_URL || 'http://localhost:8200',
                environment: process.env.NODE_ENV || 'Development'
            });
        }
    
        if (!apm) {
            Logger.info('Agent already running');
            apm = apm_instance;
        }
    }
}