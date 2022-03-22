import { createTerminus, TerminusOptions } from '@godaddy/terminus';
import { Server } from 'http';
import { ResponseStatus } from '../utils/consts';
import { Logger } from './logger.config';

console.log('import probe.config');

export module ProbeServer {
    export let readyFlag: boolean = false;
    export let liveFlag: boolean = true;
    const _errors = [];

    const onSignal = async (): Promise<any> => {
        console.log('server is starting cleanup');
        return Promise.all([
            // your clean logic, like closing database connections
        ]);
    }

    const beforeShutdown = async (): Promise<any> => {
        console.log('before shutdown has been called')
    }

    const onShutdown = async (): Promise<any> => {
        console.log('cleanup finished, server is shutting down');
    }

    const onSendFailureDuringShutdown = async (): Promise<any> => {
        console.log("onSendFailureDuringShutdown, not implemented");
    }

    const liveness = (): Promise<void> => {
        console.log(`liveness probe = ${liveFlag}`);
        if (liveFlag) {
            return Promise.resolve();
        } else {
            // throw new HealthCheckError("liveness failed", this._errors);
            console.error('liveness failed', _errors);
        }
    }

    const readiness = (): Promise<void> => {
        console.log(`readiness probe = ${readyFlag}`);
        if (readyFlag) {
            return Promise.resolve();
        } else {
            // throw new HealthCheckError("rediness failed", this._errors);
            console.error("rediness failed", _errors);
        }
    }

    export const initializeProbeServer = (server: Server): void => {
        process.on("uncaughtException", (err) => {
            console.error(`uncaughtException ${err}`);
            _errors.push(`uncaughtException ${err}`);
            liveFlag = false;
        });

        const options: TerminusOptions = {
            // health check options
            healthChecks: {
                "/liveness": /* _config.liveness || */ liveness, // a promise returning function indicating service health
                "/readiness": /* _config.readiness || */ readiness, // a promise returning function indicating service health
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
            beforeShutdown,                   // [optional] called before the HTTP server starts its shutdown
            onSignal,                         // [optional] cleanup function, returning a promise (used to be onSigterm)
            onShutdown,                       // [optional] called right before exiting
            onSendFailureDuringShutdown,      // [optional] called before sending each 503 during shutdowns
            logger: (msg: string, err: Error) => Logger.error(msg, { err, tag: 'Terminus' }) // [optional] logger function to be called with errors. Example logger call: ('error happened during shutdown', error). See terminus.js for more details.
        }
        
        createTerminus(server, options)
            .on('listening', (ex) => {})
            .on('error', (ex) => {
                readyFlag = false;
                liveFlag = false;
                _errors.push(ex);
                console.error(
                    "error",
                    `Error start prob server: ${ex}`
                );
            });
    }
}