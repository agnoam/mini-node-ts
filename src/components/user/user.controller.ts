import { Request, Response } from "express";
import { ResponseStatus } from "../../utils/consts";
import { UserModel, IUser, InputUserData } from './user.model';
import { UserDataLayer } from "./user.datalayer";

console.log("import app.controller");

export module UserCtrl {
    export function returnSomething_R(req: Request, res: Response): Response {
        return res.status(ResponseStatus.Ok).json({
            date: Date.now(),
            description: 'This is the date right now'
        });
    }

    export async function login_R(req: Request, res: Response): Promise<Response> {
        const reqBody: LoginRequestBody = req.body as LoginRequestBody;
        if (reqBody.username && reqBody.password) {
            // Encrypting the password with md5
            const userData: IUser = await UserDataLayer.isLegit(reqBody.username, reqBody.password);
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
                UserDataLayer.createNewUser(userData);
                return res.status(ResponseStatus.Ok).json({ description: 'User created successfuly' });
            } catch(ex) {
                console.error('MongoDB creation ex: ', ex);
            }
        }

        return res.status(ResponseStatus.InternalError).json({ description: 'Operation failed, please try again' });
    }

    export async function deleteUser_R(req: Request, res: Response): Promise<Response> {
        const userData: LoginRequestBody = req.body;

        try {
            if(await UserDataLayer.isLegit(userData.username, userData.password)) {
                UserDataLayer.deleteUser(userData.username);
                return res.status(ResponseStatus.Ok).json({
                    description: 'User deleted successfuly'
                });
            }
            
            return res.status(ResponseStatus.Ok).json({ 
                description: 'User credentials is not accurte, Please change and try again'
            });
        } catch(ex) {
            console.error(ex);
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