
/************* Moduls **************/
import bodyParser from "body-parser";
import express, { Application } from "express";
import os from "os";
import { ServerMiddleware } from "./middlewares/server.middleware";
import { RoutesConfig } from "./config/routes.config";
import { DBDriver } from "./config/mongo.config";
import http, { Server } from "http";
import socketIO from "socket.io";
// import { initializeFirebase } from './config/firebase.config';

export module ServerBoot {
  const port: number = +process.env.PORT || 8810;
  let app: Application;
  export let server: Server;
  export let io: SocketIO.Server;

  export const initializeServer = (): void => {
    app = express();
    server = createServer();

    // Remove this if you does not want socket.io in your project
    io = getSocket(server); 

    listen();
  }

  const createServer = (): Server => {
    return http.createServer(app);
  }

  /* If you don't need socket.io in your project delete this, 
    and don't forget to remove the `socket.io`, `@types/socket.io` dependencies */
  const getSocket = (server: Server): socketIO.Server => {
    return socketIO.listen(server);
  }

  const listen = (): void => {
    loadMiddlewares();
    configModules();
    
    const localIP: string = findMyIP();

    server.listen(port, () => {
      console.log(`Our app server is running on http://${os.hostname()}:${port}`);
      console.log(`Server running on: http://${localIP}:${port}`);
    });
  }

  const configModules = (): void => {
    DBDriver.connect();
    // initializeFirebase();

    RoutesConfig(app);
  }

  const loadMiddlewares = (): void => {
    app.use( bodyParser.json() );
    app.use( bodyParser.urlencoded({ extended: true }) );
    app.use( ServerMiddleware );
  }

  export const findMyIP = (): string => {
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

    return localIP;
  }
} 

interface NetworkInterface {
  [index: string]: os.NetworkInterfaceInfo[];
}

// Running the server
ServerBoot.initializeServer();
