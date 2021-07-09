import { DocumentQuery } from "mongoose";
import { InputUserData, IUser, UserModel } from "./user.model";
import md5 from 'md5';

// Required imports for firebase to function properly
// import { db } from '../config/firebase.config';
// import { database } from "firebase-admin";
// import { User } from '../models/user.model';
// import { userDefaultImage } from '../models/user.model';

/* 
    Description: 
    The DataLayer module contains all the calls to DB. At the time the controller module has the logic
*/
export module UserDataLayer {
    export async function createNewUser(userData: InputUserData): Promise<IUser> {
        // Hashing password before saving it to the DB
        userData.password = md5(userData.password);
        return await UserModel.create(userData);
    }

    export function deleteUser(username: string): void {
        UserModel.remove({ username });
    }

    export async function isLegit(username: string, password: string): Promise<IUser> {
        try {
            const userQuery: DocumentQuery<IUser, IUser> = UserModel.findOne({ username: username });
            const userData: IUser = await userQuery.exec();

            // Encrypting the password with md5
            if(userData.password === md5(password)) {
                return userData;
            }

            return null;
        } catch(ex) {
            console.error(`ex with querying mongodb: `, ex);
        }
    }

    /*********************************** Firebase Create/ Update / Read / Delete Example ***********************************/
    // export async function firebaseLogin(username: string, password: string): Promise<boolean> {
    //     try {
    //         const userQuery: database.Query = db.ref(`/users/`).child('username').equalTo(username);
    //         const snapshot: database.DataSnapshot = await userQuery.once('value');
            
    //         if(snapshot.exists()) {
    //             const user: User = snapshot.val();
    //             if(user.password === md5(password)) {
    //                 return true;
    //             }
    //             return false;
    //         }

    //         throw "User doesn't exists";
    //     } catch(ex) {
    //         throw ex;
    //     }
    // }

    // export async function firebaseSignUp(user: User): Promise<string> {
    //     const usersRef: database.Reference = db.ref('/users');
        
    //     if(user.password && user.email && user.name && user.username) {
    //         user.password = md5(user.password);
    //         user.profileImage = !user.profileImage ? userDefaultImage : user.profileImage;
    //         user.date = !user.date ? Date.now() : user.date;

    //         if(!await firebaseIsExists({ username: user.username, email: user.email })) {
    //             try {
    //                 const newRef: database.Reference = await usersRef.push(user);
    //                 return newRef.key;
    //             } catch(ex) {
    //                 throw { description: 'firebase push ex', data: ex };
    //             }
    //         }
    //     }
    //     throw 'Missing reqired propery of the user';
    // }

    // export async function firebaseIsExists(data: { username?: string, email?: string }): Promise<string> {
    //     if(data.username || data.email) {
    //         const usersRef: database.Reference = db.ref('/users');

    //         if(data.username) {
    //             try {
    //                 return await firebaseIsValueExists(usersRef, 'username', data.username);
    //             } catch(ex) { 
    //                 throw { description: 'username query firebase ex', data: ex }; 
    //             }
    //         } else if(data.email) {
    //             try {
    //                 return await firebaseIsValueExists(usersRef, 'email', data.email);
    //             } catch(ex) { 
    //                 throw { description: 'email query firebase ex', data: ex }; 
    //             }
    //         }
    //     }

    //     throw 'Data must have username or email, Fill the data and try again';
    // }

    // export async function firebaseIsValueExists(ref: database.Reference, childName: string, equalTo: any): Promise<string> {
    //     const usernameQuery: database.Query = ref.child(childName).equalTo(equalTo);
    //     const snapshot: database.DataSnapshot = await usernameQuery.once('value');
        
    //     return !snapshot.exists() ? snapshot.key : null;
    // }

    // export async function firebaseDelete(userID: string): Promise<void> {
    //     try {
    //         const userRef: database.Reference = db.ref(`/users/${userID}`);
    //         await userRef.remove();
    //     } catch(ex) {
    //         throw {
    //             description: 'firebase database user remove ex',
    //             data: ex
    //         }
    //     }
    // }
}