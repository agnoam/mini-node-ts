/************* Moduls **************/
import bodyParser from "body-parser";
import express from "express";
import os from "os";
import { ServerMiddleware } from "./middlewares/app.middleware";
import { RoutesConfig } from "./config/routes.config";
import { DBDriver } from "./config/mongo.config";
// import { initializeFirebase } from './config/firebase.config';

const app: express.Application = express();
const port: number = +process.env.PORT || 8810; // + means cast to number type in typescript

// Get the server's local ip
const ifaces: NetworkInterface = os.networkInterfaces();
let localIP: string;

Object.keys(ifaces).forEach((ifname) => {
  let alias: number = 0;

  ifaces[ifname].forEach((iface) => {
    if ("IPv4" !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias < 1) {
      localIP = iface.address;
    }
    
    ++alias;
  });
});


/****************** Configs ******************/
DBDriver.connect();
// initializeFirebase();
/**************** Middelwares ****************/
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: true }) );
app.use( ServerMiddleware );
/******************** API ********************/
RoutesConfig(app);
/*********************************************/

app.listen(port, () => {
  console.log(`Our app server is running on http://${os.hostname()}:${port}`);
  console.log(`Server running on: http://${localIP}:${port}`);
});

interface NetworkInterface {
  [index: string]: os.NetworkInterfaceInfo[];
}