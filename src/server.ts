
/************* Moduls **************/
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
  let app: Application = express();
  export let server: Server = createServer();
  // Remove this if you does not want socket.io in your project
  export let io: SocketIO.Server = getSocket(server);

  function createServer(): Server {
    return http.createServer(app);
  }

  /* If you don't need socket.io in your project delete this, 
    and don't forget to remove the `socket.io`, `@types/socket.io` dependencies */
  function getSocket(server: Server): socketIO.Server {
    return socketIO.listen(server);
  }

  export const listen = (): void => {
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
    app.use( express.json() );
    app.use( express.urlencoded({ extended: true }) );
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
ServerBoot.listen();
