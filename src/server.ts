
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

export class ServerBoot {
  private readonly port: number = +process.env.PORT || 8810;
  private app: Application;
  public server: Server;
  public io: SocketIO.Server;

  constructor() {
    this.app = express();
    this.server = this.createServer();

    // Remove this if you does not want socket.io in your project
    this.io = this.getSocket(this.server); 

    this.listen();
  }

  private createServer(): Server {
    return http.createServer(this.app);
  }

  /* If you don't need socket.io in your project delete this, 
    and don't forget to remove the `socket.io`, `@types/socket.io` dependencies */
  private getSocket(server: Server): socketIO.Server {
    return socketIO.listen(server);
  }

  private listen(): void {
    this.loadMiddlewares();
    this.configModules();
    
    const localIP: string = this.findMyIP();

    this.server.listen(this.port, () => {
      console.log(`Our app server is running on http://${os.hostname()}:${this.port}`);
      console.log(`Server running on: http://${localIP}:${this.port}`);
    });
  }

  private configModules(): void {
    DBDriver.connect();
    // initializeFirebase();

    RoutesConfig(this.app);
  }

  private loadMiddlewares(): void {
    this.app.use( bodyParser.json() );
    this.app.use( bodyParser.urlencoded({ extended: true }) );
    this.app.use( ServerMiddleware );
  }

  public findMyIP(): string {
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
const serverInstance: ServerBoot = new ServerBoot();
