import { Router } from "express";
import { UserCtrl } from './user.controller';

console.log("import app.routes");

// The node.js simple code here
export const userRouter: Router = Router();

// The post port like this
userRouter
  .post('/login', UserCtrl.login_R)
  .post('/sign-up', UserCtrl.signUp_R)
  .post('/post', UserCtrl.doPost_R);
