/************* Moduls **************/
import bodyParser from "body-parser";
import express, { Application } from "express";
import os from "os";
import { ServerMiddleware } from "./middlewares/app.middleware";
import { RoutesConfig } from "./config/routes.config";
import { DBDriver } from "./config/mongo.config";
import http, { Server } from "http";
// import { initializeFirebase } from './config/firebase.config';

export class ServerBoot {
  private readonly port: number = +process.env.PORT || 8810;
  private app: Application;
  private server: Server;

  constructor() {
    this.app = express();

    this.server = this.createServer();

    this.configModules();
    this.loadMiddlewares();

    this.serverListen();
  }

  private createServer(): Server {
    return http.createServer(this.app);
  }

  private serverListen(): void {
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