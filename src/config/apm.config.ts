import apm_instance from 'elastic-apm-node';
import packageJSON from '../../package.json';

import dotenv from 'dotenv';
dotenv.config();

console.log('import apm.config');

const startAPM = () => {  
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

export const apm = startAPM();