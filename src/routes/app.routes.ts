import { Router } from "express";
import { AppCtrl } from '../controllers/app.controller';

console.log("import app.routes");

// The node.js simple code here
export const appRouter: Router = Router();

// The post port like this
appRouter.post('/post', AppCtrl.doPost_R);