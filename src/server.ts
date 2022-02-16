import "reflect-metadata"; // Used for dependcy-injection (inversify)

import express, { Application } from "express";
import os from "os";
import socketIO from "socket.io";
import http, { Server } from "http";

import { ETCDConfig } from "./config/etcd.config";
import { ServerMiddleware } from "./middlewares/server.middleware";
import { SwaggerConfig } from "./config/swagger.config";
import { apm } from './config/apm.config';

export module ServerBoot {
	const port: number = +process.env.PORT || 8810;
	export const app: Application = express(); // Exported for testings
	export const server: Server = createServer();
	
	// TODO: Remove this if you does not want socket.io in your project
	export const io: SocketIO.Server = getSocket(server);

	function createServer(): Server {
		return http.createServer(app);
	}

	/* TODO: If you don't need socket.io in your project delete this, 
		and don't forget to remove the `socket.io`, `@types/socket.io` dependencies */
	function getSocket(server: Server): socketIO.Server {
		return socketIO.listen(server);
	}

	export const listen = async (): Promise<Application> => {
		await ETCDConfig.initialize({ hosts: 'http://localhost:5000' }, { 
			envParams: {
				ELASTIC_APM_SERVER_URL: 'test'
			}
		});

		console.log('ELASTIC_APM_SERVER_URL:', process.env.ELASTIC_APM_SERVER_URL);
		
		loadMiddlewares();
		await configModules();
		
		const localIP: string = findMyIP();
		return new Promise( (resolve, reject) => {
			server.listen(port, () => {
				console.log(`Our app server is running on http://${os.hostname()}:${port}`);
				console.log(`Server running on: http://${localIP}:${port}`);
				resolve(app);
			});
		});
	}

	const configModules = async (): Promise<void> => {
		await SwaggerConfig(app);
	}

	const loadMiddlewares = (): void => {
		app.use( express.json() );
		app.use( express.urlencoded({ extended: true }) );
		app.use( ServerMiddleware );
	}

	export const findMyIP = (): string => {
		const span = apm.startSpan('Finding IP address');
		
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

		span?.end();
		return localIP; 
	}
} 

interface NetworkInterface {
	[index: string]: os.NetworkInterfaceInfo[];
}

if (process.env.NODE_ENV !== "test") {
	// Running the server
	ServerBoot.listen();
}