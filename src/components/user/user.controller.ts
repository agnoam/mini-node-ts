import { apm } from '../../config/apm.config';
import { Request, Response } from "express";
import { ResponseStatus } from "../../utils/consts";
import { IUser, InputUserData } from './user.model';
import { UserDataLayer } from "./user.datalayer";
import { inject, injectable } from "inversify";
import { TYPES } from "../../config/di.types.config";
import { Transaction, Span } from 'elastic-apm-node';
import { Logger } from '../../config/logger.config';

console.log("import app.controller");

@injectable()
export class UserCtrl {
    constructor(@inject(TYPES.UserDataLayer) private userDataLayer: UserDataLayer) {}

    test_R(req: Request, res: Response): Response {
        const transaction: Transaction = apm.startTransaction('some_test');
        
        console.log('running something...');
        this.someFunc(transaction);
        
        transaction.end();

        Logger.info('test_R() executed');
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
        const transaction = apm.startTransaction('User login request');
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
        const transaction: Transaction = apm.startTransaction('Signing up new user');
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
                apm.captureError(ex);
            }
        }

        transaction.end();
        return res.status(ResponseStatus.InternalError).json({ description: 'Operation failed, please try again' });
    }

    async deleteUser_R(req: Request, res: Response): Promise<Response> {
        const transaction: Transaction = apm.startTransaction('User delete request');
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
            apm.captureError(ex);
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