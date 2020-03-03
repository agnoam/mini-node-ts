import { Request, Response } from "express";
import { ResponseStatus } from "../utils/consts";
import { UserModel, IUser } from '../models/user.model';
import { DocumentQuery } from "mongoose";
import md5 from 'md5';

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
            const userQuery: DocumentQuery<IUser, IUser> = 
                UserModel.findOne({ username: reqBody.username });
            const userData: IUser = await userQuery.exec();

            // Encrypting the password with md5
            if(userData.password === md5(reqBody.password)) {
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
}

interface LoginRequestBody {
    username: string;
    password: string;
}