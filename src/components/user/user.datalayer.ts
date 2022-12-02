import { inject, injectable } from "inversify";
import { Agent } from 'elastic-apm-node';
import md5 from 'md5';

import { TYPES } from "../../configs/di.types.config";
import { APMDriver } from '../../drivers/apm.driver';
import { DbDriver } from "../../drivers/db.driver";
import { InputUserData, IUser, UserModel } from "./user.model";

/* 
    Description: 
    The DataLayer module contains all the calls to DB. At the time the controller module has the logic
*/
@injectable()
export class UserDataLayer {
    constructor(/*@inject(TYPES.DbDriver) db: DbDriver*/) {}
    
    @APMDriver.traceMethod({ spanName: 'Writing user to DB' })
    async createNewUser(userData: InputUserData): Promise<IUser> {
        // Hashing password before saving it to the DB
        userData.password = md5(userData.password);
        return await UserModel.create(userData);
    }

    @APMDriver.traceMethod({ spanName: 'Delete user from DB' })
    deleteUser(username: string): void {
        UserModel.remove({ username });
    }

    @APMDriver.traceMethod({ spanName: 'Is creds verified' })
    async isLegit(username: string, password: string): Promise<IUser> {
        try {
            // const userQuery: DocumentQuery<IUser, IUser> = UserModel.findOne({ username: username });
            // const userData: IUser = await userQuery.exec();

            // Encrypting the password with md5
            // if(userData.password === md5(password)) {
            //     span.end();
            //     return userData;
            // }
            return null;
        } catch(ex) {
            console.error(`ex with querying db: `, ex);
            throw ex;
        }
    }
}