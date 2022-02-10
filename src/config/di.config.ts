import { Container } from "inversify";

import { TYPES } from "./di.types.config";
import { UserCtrl } from './../components/user/user.controller';
import { UserDataLayer } from './../components/user/user.datalayer';
// import { IDefaultDataLayer, DefaultDataLayer } from "../components/default/default.datalayer";
// import { /* IDbDriver, */ DbDriver } from "./db.config";
// import { IEtcdDriver, EtcdDriver } from "./etcd.config";
// import { IDefaultCtrl, DefaultCtrl } from '../components/default/default.controller';

export const container: Container = new Container();

// container.bind<DbDriver>(TYPES.DBConfig).to(DbDriver);
// container.bind<IEtcdDriver>(TYPES.EtcdDriver).to(EtcdDriver);

container.bind<UserCtrl>(TYPES.UserCtrl).to(UserCtrl);
container.bind<UserDataLayer>(TYPES.UserDataLayer).to(UserDataLayer);
// container.bind<IDefaultDataLayer>(TYPES.DefaultDataLayer).to(DefaultDataLayer);