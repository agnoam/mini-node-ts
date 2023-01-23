import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { APMDriver } from '../drivers/apm.driver';
import { TYPES } from '../configs/di.types.config';
import { LoggerDriver } from '../drivers/logger.driver';

@injectable()
export class DefaultPresentationLayer {
    constructor(@inject(TYPES.LoggerDriver) loggerDriver: LoggerDriver) {}

    @APMDriver.traceMethod({ transactionName: 'Root route' })
    defaultRoot_R(req: Request, res: Response, next: NextFunction): void {
        res.send('node-ts server is running ;) (by swagger router)');
    }
}