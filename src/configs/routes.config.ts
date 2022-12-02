import { container } from './di.driver';
import { TYPES } from "./di.types.config";

import { DefaultPresentationLayer } from '../components/default.presentation';
import { UserPresntationLayer } from '../components/user/user.presentation';

const defaultPL: DefaultPresentationLayer = container.get(TYPES.DefaultPresentationLayer);
const userPL: UserPresntationLayer = container.get(TYPES.UserPresentationLayer);

console.log("import routes.config");

// This file exposes all wanted BLOC (Business logic) functions implemntation to the `swagger.yaml`
export const defaultRoute = defaultPL.defaultRoot_R.bind(defaultPL);
export const testRequest = userPL.test_R.bind(userPL);