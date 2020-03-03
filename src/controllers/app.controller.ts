import { Request, Response } from "express";
import { ResponseStatus } from "../utils/consts";
import { UserModel, IUser } from '../models/user.model';
import { DocumentQuery } from "mongoose";
import md5 from 'md5';

// Required imports for firebase to function properly
// import { db } from '../config/firebase.config';
// import { database } from "firebase-admin";
// import { User } from '../models/user.model';
// import { userDefaultImage } from '../models/user.model';

console.log("import app.controller");

export module AppCtrl {
    export function doPost_R(req: Request, res: Response): Response {
        return res.status(ResponseStatus.Ok).json({
            date: Date.now(),
            description: 'This is the date right now'
        });
    }

    export async function login_R(req: Request, res: Response): Promise<Response> {
        const reqBody: LoginRequestBody = req.body;
        if(reqBody.username && reqBody.password) {
            // Encrypting the password with md5
            const userData: IUser = await isLegit(reqBody.username, reqBody.password);
            if(userData) {
                return res.status(ResponseStatus.Ok).json({
                    name: userData.name,
                    profileImage: userData.profileImage,
                    date: userData.date
                });
            }
        }

        return res.status(ResponseStatus.BadRequest).json({
            description: 'Request must have username and password fields in body'
        });
    }

    export async function signUp_R(req: Request, res: Response): Promise<Response> {
        const userData = {
            username: req.body.username,
            password: md5(req.body.password),
            email: req.body.email,
            name: req.body.name,
            profileImage: req.body.profileImagePath
        }

        if(userData.username && userData.password && userData.email && userData.name) {
            // Deletes the profileImage if does not exists
            !userData.profileImage ? delete userData.profileImage : null;

            try {
                await UserModel.create(userData);
                return res.status(ResponseStatus.Ok).json({ description: 'User created successfuly' });
            } catch(ex) {
                console.error('MongoDB creation ex: ', ex);
            }
        }

        return res.status(ResponseStatus.InternalError).json({ description: 'Operation failed, please try again' });
    }

    export async function deleteUser_R(req: Request, res: Response): Promise<Response> {
        const userData = {
            username: req.body.username,
            password: req.body.password
        }

        try {
            if(await isLegit(userData.username, userData.password)) {
                UserModel.remove({ username: userData.username });
                return res.status(ResponseStatus.Ok).json({
                    description: 'User deleted successfuly'
                });
            }
        } catch(ex) {
            console.error(ex);
            return res.status(ResponseStatus.InternalError).json({
                description: 'There was an error, User delete did not happened'
            });
        }
    }

    async function isLegit(username: string, password: string): Promise<IUser> {
        try {
            const userQuery: DocumentQuery<IUser, IUser> = 
                UserModel.findOne({ username: username });
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

    /*********************************** Firebase Read / Write / Delete Example ***********************************/
    // function firebaseLogin(username: string, password: string): Promise<boolean> {
    //     return new Promise( (resolve, reject) => {
    //         const userQuery: database.Query = db.ref(`/users/`).child('username').equalTo(username);
    //         userQuery.once('value', (snapshot: database.DataSnapshot) => {
    //             if(snapshot.exists()) {
    //                 const user: User = snapshot.val();
    //                 if(user.password === md5(password)) {
    //                     return resolve(true);
    //                 }
    //                 return resolve(false);
    //             }
    //             return reject("User doesn't exists");
    //         },
    //         (ex) => {
    //             throw ex;
    //         });
    //     });
    // }

    // function firebaseSignUp(user: User): Promise<string> {
    //     return new Promise( async (resolve, reject) => {
    //         const usersRef: database.Reference = db.ref('/users');
            
    //         if(user.password && user.email && user.name && user.username) {
    //             user.password = md5(user.password);
    //             user.profileImage = !user.profileImage ? userDefaultImage : user.profileImage;
    //             user.date = !user.date ? Date.now() : user.date;

    //             if(!await firebaseIsExists({ username: user.username, email: user.email })) {
    //                 const newRef: database.ThenableReference = usersRef.push(user, (ex: Error) => {
    //                     if(ex) return reject({ description: 'firebase push ex', data: ex });
    //                 });

    //                 return resolve(newRef.key);
    //             }
    //         }
    //         return reject('Missing reqired propery of the user');
    //     });
    // }

    // function firebaseIsExists(data: { username?: string, email?: string }): Promise<string> {
    //     return new Promise( (resolve, reject) => {
    //         if(data.username || data.email) {
    //             const usersRef: database.Reference = db.ref('/users');
    //             if(data.username) {
    //                 const usernameQuery: database.Query = usersRef.child('username').equalTo(data.username);
    //                 usernameQuery.once('value', (snapshot: database.DataSnapshot) => {
    //                     return resolve(!snapshot.exists() ? snapshot.key : null);
    //                 },
    //                 (ex) => reject({ description: 'username query firebase ex', data: ex }));
    //             } else if(data.email) {
    //                 const emailQuery: database.Query = usersRef.child('email').equalTo(data.email);
    //                 emailQuery.once('value', (snapshot: database.DataSnapshot) => {
    //                     return resolve(!snapshot.exists() ? snapshot.key : null);
    //                 },
    //                 (ex) => reject({ description: 'username query firebase ex', data: ex }));
    //             }

    //             return reject('Data must have username or email, Fill the data and try again');   
    //         }
    //     });
    // }

    // function firebaseDelete(userID: string): Promise<void> {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             const userRef: database.Reference = db.ref(`/users/${userID}`);
    //             await userRef.remove((ex: Error) => {
    //                 if(ex) { 
    //                     return reject({
    //                         description: 'firebase database user remove ex',
    //                         data: ex
    //                     });
    //                 }
    //             });

    //             return resolve();
    //         } catch(ex) {
    //             return reject(ex);
    //         }
    //     });
    // }
}

interface LoginRequestBody {
    username: string;
    password: string;
}