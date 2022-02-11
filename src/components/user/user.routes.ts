import { Router } from "express";
import { container } from './../../config/di.config';
import { UserCtrl } from './user.controller';
import { TYPES } from './../../config/di.types.config';

console.log("import app.routes");

// The node.js simple code here
export const userRouter: Router = Router();
const userCtrl: UserCtrl = container.get<UserCtrl>(TYPES.UserCtrl);

// The post port like this
userRouter
  .post('/login', userCtrl.login_R)
  .post('/sign-up', userCtrl.signUp_R)
  .get('/return-something', (req, res) => userCtrl.returnSomething_R(req, res));
