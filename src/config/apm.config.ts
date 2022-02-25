import apm_instance, { Agent } from 'elastic-apm-node';
import packageJSON from '../../package.json';

console.log('import apm.config');

export let apm: Agent;
export module APMConfig {
    export const initializeAPM = (): void => {  
        console.log('Trying to start APM agent');
        
        if (!apm_instance.isStarted()) {
            console.log('Starting apm agent');
            apm = apm_instance.start({
                frameworkVersion: process.version,
                serviceName: process.env.ELASTIC_APM_SERVICE_NAME || packageJSON.name,
                serviceVersion: packageJSON.version,
                serverUrl: process.env.ELASTIC_APM_SERVER_URL || 'http://localhost:8200',
                environment: process.env.NODE_ENV || 'Development'
            });
        }
    
        console.log('Agent already running');
        apm = apm_instance;
    }
}