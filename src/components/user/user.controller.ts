import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { Logger } from 'winston';
import { Transaction, Span, Agent } from 'elastic-apm-node';

import { TYPES } from "../../configs/di.types.config";
import { LoggerDriver } from '../../drivers/logger.driver';
import { APMDriver } from '../../drivers/apm.driver';
import { IUser, InputUserData } from './user.model';
import { UserDataLayer } from "./user.datalayer";
import { LoginRequestBody } from "./user.presentation";

console.log("import app.controller");

@injectable()
export class UserCtrl {
    private Logger: Logger;

    constructor(
        @inject(TYPES.LoggerDriver) LoggerDriver: LoggerDriver,
        @inject(TYPES.UserDataLayer) private userDataLayer: UserDataLayer
    ) {
        this.Logger = LoggerDriver.Logger;
    }
        
    @APMDriver.traceMethod({ spanName: 'Verify user' /* , spanTypes: SpanTypes.BLOC */ })
    async verifyUser(reqBody: LoginRequestBody): Promise<any> {
        if (reqBody.username && reqBody.password) {
            // Encrypting the password with md5
            const userData: IUser = await this.userDataLayer.isLegit(reqBody.username, reqBody.password);
            
            if (!userData) return null;
            return {
                name: userData.name,
                profileImage: userData.profileImage,
                date: userData.date
            }
        }
    }

    @APMDriver.traceMethod({ spanName: 'Test function' })
    someFunc(): void {
        console.log('someFunc');

        for (let i = 0; i < 1000; i++) {
            // calculating something
            i ** 2;
        }
    }

    @APMDriver.traceMethod({ spanName: 'Create user BLOC' })
    async createUser(userData: InputUserData): Promise<void> {
        if(userData.username && userData.password && userData.email && userData.name) {
            // Deletes the profileImage if does not exists
            !userData.profileImage ? delete userData.profileImage : undefined;

            try {
                await this.userDataLayer.createNewUser(userData);
            } catch(ex) {
                console.error('MongoDB creation ex: ', ex);
                throw ex;
            }
        }
    }

    @APMDriver.traceMethod({ spanName: 'Delete user BLOC' })
    async deleteUserFlow(userData: LoginRequestBody): Promise<void> {
        if (await this.userDataLayer.isLegit(userData.username, userData.password))
            this.userDataLayer.deleteUser(userData.username);
    }
}
