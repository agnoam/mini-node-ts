import "reflect-metadata"; // Used for dependcy-injection (inversify)

import http, { Server } from "http";
import express, { Application } from "express";
import os from "os";
import winston from "winston";
import socketIO from "socket.io";
import { Span, Agent } from 'elastic-apm-node';
import { inject, injectable } from "inversify";

import { ETCDConfig } from "./config/etcd.config";
import { LoggerConfig } from "./config/logger.config";
import { APMConfig } from './config/apm.config';
import { TYPES } from "./config/di.types.config";
import { ServerMiddleware } from "./middlewares/server.middleware";
import { SwaggerConfig } from "./config/swagger.config";
import { ProbeServer } from "./config/probe.config";
import MorganMiddleware from './middlewares/morgan.middleware';
import ErrorMiddleware from "./middlewares/error.middleware";

import dotenv from 'dotenv';
import { container } from "./config/di.config";
dotenv.config();

@injectable()
export class ServerBoot {
	private port: number = +process.env.PORT || 8810;
	app: Application = express(); // Exported for testings
	server: Server = this.createServer();
	
	// TODO: Remove this if you does not want socket.io in your project
	io: SocketIO.Server = this.getSocket(this.server);

	private Logger: winston.Logger;
	private apm: Agent;

	constructor(
		@inject(TYPES.LoggerConfig) private LoggerConfig: LoggerConfig, 
		@inject(TYPES.APMConfig) private APMConfig: APMConfig, 
		@inject(TYPES.ETCDConfig) private ETCDConfig: ETCDConfig,
		@inject(TYPES.ProbeServerConfig) private ProbeServer: ProbeServer,
		@inject(TYPES.MorganMiddleware) private MorganMiddleware: MorganMiddleware
	) {}

	private createServer(): Server {
		return http.createServer(this.app);
	}

	/* TODO: If you don't need socket.io in your project delete this, 
		and don't forget to remove the `socket.io`, `@types/socket.io` dependencies */
	private getSocket(server: Server): socketIO.Server {
		return socketIO.listen(server);
	}

	async listen(): Promise<Application> {
		await this.initializeConfigs();
		await this.loadMiddlewares();
		
		const localIP: string = this.findMyIP();
		return new Promise( (resolve, reject) => {
			this.server.listen(this.port, () => {
				this.Logger.info(`Our app server is running on http://${os.hostname()}:${this.port}`);
				this.Logger.info(`Server running on: http://${localIP}:${this.port}`);
				resolve(this.app);
			});
		});
	}

	private async initializeConfigs(): Promise<void> {
		await this.ETCDConfig.initialize({ hosts: process.env.ETCD_HOST }, {
			moduleConfigs: { genKeys: true, watchKeys: true, overrideSysObj: true },
			envParams: {
				ELASTIC_APM_SERVER_URL: 'test',
				MONGODB_URI: { defaultValue: undefined, etcdPath: 'mongodb_uri' },
				ELASTICSEARCH_URI: 'http://localhost:9200'
			}
		});
		
		this.LoggerConfig.initialize();
		this.APMConfig.initializeAPM();
		
		this.Logger = this.LoggerConfig.Logger;
		this.Logger.info('Configurations initialized successfuly');
	}

	private async loadMiddlewares(): Promise<void> {
		this.app.use( express.json() );
		this.app.use( express.urlencoded({ extended: true }) );
		this.app.use( ErrorMiddleware );
		this.app.use( this.MorganMiddleware.implementation );
		this.app.use( ServerMiddleware );

		await SwaggerConfig(this.app);
		this.ProbeServer.initializeProbeServer(this.server);
	}

	public findMyIP(): string {
		const span: Span = this.apm.startSpan('Finding IP address');
		
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

// if (process.env.NODE_ENV !== "test") {
	// // Running the server
	// ServerBoot().listen();
// }

const _loggerConfig = container.get<LoggerConfig>(TYPES.LoggerConfig);
const _apmConfig = container.get<APMConfig>(TYPES.APMConfig);
const _etcdConfig = container.get<ETCDConfig>(TYPES.ETCDConfig);
const _probeServer = container.get<ProbeServer>(TYPES.ProbeServerConfig);
const _morganMiddleware = container.get<MorganMiddleware>(TYPES.MorganMiddleware);

new ServerBoot(_loggerConfig, _apmConfig, _etcdConfig, _probeServer, _morganMiddleware).listen();