import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { Logger } from 'winston';
import { Transaction, Span, Agent } from 'elastic-apm-node';

import { TYPES } from "../../config/di.types.config";
import { LoggerConfig } from '../../config/logger.config';
import { APMConfig } from '../../config/apm.config';
import { ResponseStatus } from "../../utils/consts";
import { IUser, InputUserData } from './user.model';
import { UserDataLayer } from "./user.datalayer";

console.log("import app.controller");

@injectable()
export class UserCtrl {
    private apm: Agent;
    private Logger: Logger;

    constructor(
        @inject(TYPES.APMConfig) apmConfig: APMConfig, 
        @inject(TYPES.LoggerConfig) loggerConfig: LoggerConfig,
        @inject(TYPES.UserDataLayer) private userDataLayer: UserDataLayer
    ) {
        this.apm = apmConfig.apm;
        this.Logger = loggerConfig.Logger;
    }

    test_R(req: Request, res: Response): Response {
        const transaction: Transaction = this.apm.startTransaction('some_test');
        
        console.log('running something...');
        this.someFunc(transaction);
        
        transaction.end();

        this.Logger.info('test_R() executed');
        return res.status(ResponseStatus.Ok).json({
            date: Date.now(),
            description: 'This is the date right now'
        });
    }

    private someFunc(transaction: Transaction): void {
        const span: Span = transaction.startSpan();
        console.log('someFunc');

        for (let i = 0; i < 1000; i++) {
            // calculating something
            i ** 2;
        }

        span.end();
    }

    async login_R(req: Request, res: Response): Promise<Response> {
        const transaction = this.apm.startTransaction('User login request');
        const reqBody: LoginRequestBody = req.body as LoginRequestBody;
        
        if (reqBody.username && reqBody.password) {
            // Encrypting the password with md5
            const userData: IUser = await this.userDataLayer.isLegit(reqBody.username, reqBody.password);
            if(userData) {
                transaction.end();
                return res.status(ResponseStatus.Ok).json({
                    name: userData.name,
                    profileImage: userData.profileImage,
                    date: userData.date
                });
            }
        }

        transaction.end();
        return res.status(ResponseStatus.BadRequest).json({
            description: 'Request must have username and password fields in body'
        });
    }

    async signUp_R(req: Request, res: Response): Promise<Response> {
        const transaction: Transaction = this.apm.startTransaction('Signing up new user');
        const userData: InputUserData = {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            name: req.body.name,
            profileImage: req.body.profileImagePath
        }

        if(userData.username && userData.password && userData.email && userData.name) {
            // Deletes the profileImage if does not exists
            !userData.profileImage ? delete userData.profileImage : undefined;

            try {
                this.userDataLayer.createNewUser(userData);
                transaction.end();
                return res.status(ResponseStatus.Ok).json({ description: 'User created successfuly' });
            } catch(ex) {
                console.error('MongoDB creation ex: ', ex);
                this.apm.captureError(ex);
            }
        }

        transaction.end();
        return res.status(ResponseStatus.InternalError).json({ description: 'Operation failed, please try again' });
    }

    async deleteUser_R(req: Request, res: Response): Promise<Response> {
        const transaction: Transaction = this.apm.startTransaction('User delete request');
        const userData: LoginRequestBody = req.body;

        try {
            if (await this.userDataLayer.isLegit(userData.username, userData.password)) {
                this.userDataLayer.deleteUser(userData.username);
                transaction.end();
                return res.status(ResponseStatus.Ok).json({
                    description: 'User deleted successfuly'
                });
            }
            
            transaction.end();
            return res.status(ResponseStatus.Ok).json({ 
                description: 'User credentials is not accurte, Please change and try again'
            });
        } catch(ex) {
            console.error(ex);
            this.apm.captureError(ex);
            return res.status(ResponseStatus.InternalError).json({
                description: 'There was an error, User delete did not happened'
            });
        }
    }
}

interface LoginRequestBody {
    username: string;
    password: string;
}