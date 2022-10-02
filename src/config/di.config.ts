import { Container } from "inversify";

import { TYPES } from "./di.types.config";
import { UserCtrl } from './../components/user/user.controller';
import { UserDataLayer } from './../components/user/user.datalayer';
// import { IDefaultDataLayer, DefaultDataLayer } from "../components/default/default.datalayer";
// import { /* IDbDriver, */ DbDriver } from "./db.config";
// import { IEtcdDriver, EtcdDriver } from "./etcd.config";
// import { IDefaultCtrl, DefaultCtrl } from '../components/default/default.controller';

import { LoggerConfig } from './logger.config';
import { APMConfig } from "./apm.config";
import { ETCDConfig } from "./etcd.config";
import MorganMiddleware from './../middlewares/morgan.middleware';
import { ProbeServer } from "./probe.config";

export const container: Container = new Container();

container.bind<ETCDConfig>(TYPES.ETCDConfig).to(ETCDConfig).inSingletonScope();
container.bind<LoggerConfig>(TYPES.LoggerConfig).to(LoggerConfig);
container.bind<APMConfig>(TYPES.APMConfig).to(APMConfig).inSingletonScope();
container.bind<ProbeServer>(TYPES.ProbeServerConfig).to(ProbeServer);
// container.bind<DbDriver>(TYPES.DBConfig).to(DbDriver);

container.bind<MorganMiddleware>(TYPES.MorganMiddleware).to(MorganMiddleware);

container.bind<UserCtrl>(TYPES.UserCtrl).to(UserCtrl);
container.bind<UserDataLayer>(TYPES.UserDataLayer).to(UserDataLayer);
// container.bind<IDefaultDataLayer>(TYPES.DefaultDataLayer).to(DefaultDataLayer);