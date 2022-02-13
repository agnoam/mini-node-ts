import { Request, Response, NextFunction } from "express";

import { container } from './di.config';
import { TYPES } from "./di.types.config";

import { UserCtrl } from './../components/user/user.controller';

const userCtrl: UserCtrl = container.get(TYPES.UserCtrl);

console.log("import routes.config");

// This file exposes all wanted BLOC (Business logic) functions implemntation to the `swagger.yaml`
export const defaultRoute = (req: Request, res: Response, next: NextFunction): Response => {
    return res.send('node-ts server is running ;) (by swagger router)');
}

export const testRequest = (req: Request, res: Response, next: NextFunction) => userCtrl.test_R(req, res);