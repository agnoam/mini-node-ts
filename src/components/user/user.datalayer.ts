import { InputUserData, IUser, UserModel } from "./user.model";
import md5 from 'md5';
import { apm } from '../../config/apm.config';
import { inject, injectable } from "inversify";
import { TYPES } from "../../config/di.types.config";
import { DbDriver } from "../../config/db.config";

/* 
    Description: 
    The DataLayer module contains all the calls to DB. At the time the controller module has the logic
*/
@injectable()
export class UserDataLayer {
    constructor(/*@inject(TYPES.DbDriver) db: DbDriver*/) {}
    
    async createNewUser(userData: InputUserData): Promise<IUser> {
        const span = apm.startSpan('Writing user to DB');
        
        // Hashing password before saving it to the DB
        userData.password = md5(userData.password);
        
        span.end();
        return await UserModel.create(userData);
    }

    deleteUser(username: string): void {
        const span = apm.startSpan('Delete user from DB');
        UserModel.remove({ username });
        span.end();
    }

    async isLegit(username: string, password: string): Promise<IUser> {
        try {
            const span = apm.startSpan('Is creds legit');
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
            apm.captureError(ex);
        }
    }
}