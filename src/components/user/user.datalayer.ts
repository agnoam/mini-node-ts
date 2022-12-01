import { inject, injectable } from "inversify";
import { Agent } from 'elastic-apm-node';
import md5 from 'md5';

import { TYPES } from "../../config/di.types.config";
import { InputUserData, IUser, UserModel } from "./user.model";
import { APMConfig } from '../../config/apm.config';
import { DbDriver } from "../../config/db.config";

/* 
    Description: 
    The DataLayer module contains all the calls to DB. At the time the controller module has the logic
*/
@injectable()
export class UserDataLayer {
    private apm: Agent;

    constructor(@inject(TYPES.APMConfig) APMConfig: APMConfig /*@inject(TYPES.DbDriver) db: DbDriver*/) {
        this.apm = APMConfig.apm;
    }
    
    async createNewUser(userData: InputUserData): Promise<IUser> {
        const span = this.apm.startSpan('Writing user to DB');
        
        // Hashing password before saving it to the DB
        userData.password = md5(userData.password);
        
        span.end();
        return await UserModel.create(userData);
    }

    deleteUser(username: string): void {
        const span = this.apm.startSpan('Delete user from DB');
        UserModel.remove({ username });
        span.end();
    }

    async isLegit(username: string, password: string): Promise<IUser> {
        try {
            const span = this.apm.startSpan('Is creds legit');
            // const userQuery: DocumentQuery<IUser, IUser> = UserModel.findOne({ username: username });
            // const userData: IUser = await userQuery.exec();

            // Encrypting the password with md5
            // if(userData.password === md5(password)) {
            //     span.end();
            //     return userData;
            // }

            span.end();
            return null;
        } catch(ex) {
            console.error(`ex with querying db: `, ex);
            this.apm.captureError(ex);
        }
    }
}