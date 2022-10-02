import { Server } from 'http';

import { Logger } from 'winston';
import { inject, injectable } from 'inversify';
import { createTerminus, TerminusOptions } from '@godaddy/terminus';

import { ResponseStatus } from '../utils/consts';
import { LoggerConfig } from './logger.config';
import { TYPES } from './di.types.config';

console.log('import probe.config');

@injectable()
export class ProbeServer {
    readyFlag: boolean = false;
    liveFlag: boolean = true;
    private _errors = [];

    private Logger: Logger;

    constructor(@inject(TYPES.LoggerConfig) LoggerConfig: LoggerConfig) {
        this.Logger = LoggerConfig.Logger;
    }

    private async onSignal (): Promise<any> {
        console.log('server is starting cleanup');
        return Promise.all([
            // your clean logic, like closing database connections
        ]);
    }

    private async beforeShutdown(): Promise<any> {
        console.log('before shutdown has been called')
    }

    private async onShutdown(): Promise<any> {
        console.log('cleanup finished, server is shutting down');
    }

    private async onSendFailureDuringShutdown(): Promise<any> {
        console.log("onSendFailureDuringShutdown, not implemented");
    }

    private async liveness(): Promise<void> {
        console.log(`liveness probe = ${this.liveFlag}`);
        if (this.liveFlag) {
            return Promise.resolve();
        } else {
            // throw new HealthCheckError("liveness failed", this._errors);
            console.error('liveness failed', this._errors);
        }
    }

    private readiness(): Promise<void> {
        console.log(`readiness probe = ${this.readyFlag}`);
        if (this.readyFlag) {
            return Promise.resolve();
        } else {
            // throw new HealthCheckError("rediness failed", this._errors);
            console.error("rediness failed", this._errors);
        }
    }

    initializeProbeServer(server: Server): void {
        process.on("uncaughtException", (err) => {
            console.error(`uncaughtException ${err}`);
            this._errors.push(`uncaughtException ${err}`);
            this.liveFlag = false;
        });

        const options: TerminusOptions = {
            // health check options
            healthChecks: {
                "/liveness": /* _config.liveness || */ this.liveness, // a promise returning function indicating service health
                "/readiness": /* _config.readiness || */ this.readiness, // a promise returning function indicating service health
                verbatim: true,                 // [optional = false] use object returned from /healthcheck verbatim in response,
                __unsafeExposeStackTraces: true // [optional = false] return stack traces in error response if healthchecks throw errors
            },

            // caseInsensitive,                  // [optional] whether given health checks routes are case insensitive (defaults to false)
            statusOk: ResponseStatus.Ok,                // [optional = 200] status to be returned for successful healthchecks
            statusError: ResponseStatus.InternalError,  // [optional = 503] status to be returned for unsuccessful healthchecks
        
            // cleanup options
            timeout: 1000,                             // [optional = 1000] number of milliseconds before forceful exiting
            signal: 'SIGTERM',                         // [optional = 'SIGTERM'] what signal to listen for relative to shutdown
            signals: ['SIGINT', 'SIGBREAK', 'SIGHUP'], // [optional = []] array of signals to listen for relative to shutdown (Added for suportting also windows pods)
            // sendFailuresDuringShutdown,       // [optional = true] whether or not to send failure (503) during shutdown
            beforeShutdown: this.beforeShutdown,                   // [optional] called before the HTTP server starts its shutdown
            onSignal: this.onSignal,                         // [optional] cleanup function, returning a promise (used to be onSigterm)
            onShutdown: this.onShutdown,                       // [optional] called right before exiting
            onSendFailureDuringShutdown: this.onSendFailureDuringShutdown,      // [optional] called before sending each 503 during shutdowns
            logger: (msg: string, err: Error) => this.Logger.error(msg, { err, tag: 'Terminus' }) // [optional] logger function to be called with errors. Example logger call: ('error happened during shutdown', error). See terminus.js for more details.
        }
        
        createTerminus(server, options)
            .on('listening', (ex) => {})
            .on('error', (ex) => {
                this.readyFlag = false;
                this.liveFlag = false;
                this._errors.push(ex);
                console.error(
                    "error",
                    `Error start prob server: ${ex}`
                );
            });
    }
}