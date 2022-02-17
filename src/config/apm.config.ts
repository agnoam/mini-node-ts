import apm_instance, { Agent } from 'elastic-apm-node';
import packageJSON from '../../package.json';

console.log('import apm.config');

const startAPM = (): Agent => {  
    console.log('Trying to start APM agent');
    
    if (!apm_instance.isStarted()) {
        console.log('Starting apm agent');
        return apm_instance.start({
            frameworkVersion: process.version,
            serviceName: process.env.ELASTIC_APM_SERVICE_NAME || packageJSON.name,
            serviceVersion: packageJSON.version,
            serverUrl: process.env.ELASTIC_APM_SERVER_URL || 'http://localhost:8200',
            environment: process.env.NODE_ENV || 'development'
        });
    }

    console.log('Agent already running');
    return apm_instance;
}

export const apm: Agent = startAPM();