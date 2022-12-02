import { inject, injectable } from "inversify";
import { Request, Response } from 'express';
import winston from 'winston';

import { ResponseStatus } from "../../utils/consts";
import { TYPES } from "../../configs/di.types.config";
import { APMDriver } from "../../drivers/apm.driver";
import { LoggerDriver } from "../../drivers/logger.driver";
import { UserCtrl } from './user.controller';
import { InputUserData } from "./user.model";

@injectable()
export class UserPresntationLayer {
    Logger: winston.Logger;

    constructor(
        @inject(TYPES.LoggerDriver) private loggerDriver: LoggerDriver, 
        @inject(TYPES.UserCtrl) private userCtrl: UserCtrl
    ) {
        this.Logger = this.loggerDriver.Logger;
    }

    @APMDriver.traceMethod({ transactionName: 'Test request handler' })
    test_R(req: Request, res: Response): Response {
        this.Logger.info('test_R() executed');
        this.userCtrl.someFunc();

        return res.status(ResponseStatus.Ok).json({
            date: Date.now(),
            description: 'This is the date right now'
        });
    }

    @APMDriver.traceMethod({ transactionName: 'Login request handler' })
    async login_R(req: Request, res: Response): Promise<void> {
        const reqBody: LoginRequestBody = req.body as LoginRequestBody;
        const verificatedUser = await this.userCtrl.verifyUser(reqBody);
        
        let statusCode: number = ResponseStatus.BadRequest;
        let payload: any = {
            description: 'Request must have username and password fields in body'
        }

        if (verificatedUser) {
            statusCode = ResponseStatus.Ok;
            payload = verificatedUser;
        }

        res.status(statusCode).json(payload);
    }

    @APMDriver.traceMethod({ transactionName: 'Sign up request handler' })
    async signUp_R(req: Request, res: Response): Promise<Response> {
        const userData: InputUserData = {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            name: req.body.name,
            profileImage: req.body.profileImagePath
        }

        this.userCtrl.createUser(userData);
        return res.status(ResponseStatus.InternalError).json({ description: 'Operation failed, please try again' });
    }

    @APMDriver.traceMethod({ transactionName: 'User delete request handler' })
    async deleteUser_R(req: Request, res: Response): Promise<void> {
        const userData: LoginRequestBody = req.body;
        let statusCode: number;
        let payload: any;

        try {
            try {
                await this.userCtrl.deleteUserFlow(userData);
                
                statusCode = ResponseStatus.Ok;
                payload = {
                    description: 'User deleted successfully'
                }
            } catch(ex) {
                statusCode = ResponseStatus.Ok;
                payload = { 
                    description: 'User credentials is not accurte, Please change and try again'
                }
            }
        } catch(ex) {
            console.error(ex);
            statusCode = ResponseStatus.InternalError
            payload = {
                description: 'There was an error, User delete did not happened'
            }
        }

        res.status(statusCode).json(payload);
    }
}

export interface LoginRequestBody {
    username: string;
    password: string;
}