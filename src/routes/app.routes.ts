import { Router } from "express";
import { AppCtrl } from '../controllers/app.controller';

console.log("import app.routes");

// The node.js simple code here
const router: Router = Router();

// The post port like this
router.post('/post', AppCtrl.doPost_R);

module.exports = router;
