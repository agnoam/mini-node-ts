// import winston from 'winston';
import { /* inject, */ injectable } from 'inversify';
import apm_instance, { Agent } from 'elastic-apm-node';
import { Transaction, Span } from 'elastic-apm-node';

// import { LoggerConfig } from '../config/logger.config';
// import { TYPES } from './di.types.config';
import packageJSON from '../../package.json';

console.log('import apm.driver');

@injectable()
export class APMDriver {
    // private Logger: winston.Logger;
    static apm: Agent;

    // constructor(@inject(TYPES.LoggerConfig) loggerConfig: LoggerConfig) {
    //     this.Logger = loggerConfig.Logger;
    // }

    static initializeAPM(): void {  
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

    static createTransaction(name: string): Transaction {
        return this.apm?.startTransaction(name);
    }

    static traceMethod(config?: TracerConfig): Function {
        console.log('tracer is running');

        return (target: any, memberName: string, descriptor: PropertyDescriptor): any => {
            let _transaction: Transaction = config?.transaction;

            let originalMethod = (descriptor.value as Function);
            descriptor.value = function (...args: any[]) {
                try {
                    if (!config?.transaction) 
                        _transaction = APMDriver.createTransaction(config?.transactionName || memberName);
                
                    const span: Span = _transaction?.startSpan(config?.spanName || memberName);
                    const result = originalMethod.apply(this, args);
                    span?.end();

                    return result;
                } catch (ex) {
                    console.error(`${memberName}() ex:`, ex);
                    this.apm?.captureError(ex);
                }
            }

            return descriptor;
        }
    }
}

export interface TracerConfig {
    transaction?: Transaction;
    transactionName?: string;
    spanName?: string;
}