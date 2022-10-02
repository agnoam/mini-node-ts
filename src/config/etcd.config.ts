import winston from 'winston';
import { inject, injectable } from 'inversify';
import { Etcd3, IKeyValue, IOptions as IETCDOptions, WatchBuilder, Watcher } from 'etcd3';

import { TYPES } from './di.types.config';
import { LoggerConfig } from './logger.config';

import dotenv from 'dotenv';
dotenv.config();

/**
 * This module used for loading environment variables from ETCD server instead of `.env` or 
 * specificly mention in environment variables of the system.
 * 
 * This configuration can:
 * - Setting parameters by `.env` variables
 * - Getting paramaters threw ETCD
 * - Watch for changes on the paramaters loaded from ETCD
 * - Override `process.env` object
 * 
 * Parameters fallback is:
 * - Trying to load the wanted parameters directly from ETCD
 * - Loading additional variables from `.env` file (default configs `dotenv`)
 * - Loading the variables from the system (node)
 * 
 * All parameters get a copy inside envParams object
 */
@injectable()
export class ETCDConfig {
    // private Logger: winston.Logger;

    private client: Etcd3 = null;
    private proccesedConfigurations: IETCDConfigurations; // The configurations after merging with the user configs
    private _etcdWatcher: WatchBuilder = null;
    envParams: IEnvParams = null;

    private defaultConfigs: IETCDConfigurations = {
        envParams: {},
        moduleConfigs: {
            dirname: process.env.ETCD_SERVICE_NAME
        }
    }

    // constructor(@inject(TYPES.LoggerConfig) LoggerConfig: LoggerConfig) {
    //     this.Logger = LoggerConfig.Logger;
    // }

    /**
     * @description This function creates a client to be to communicate with the etcd server
     * @param connectionOptions Connection options by the etcd3 library
     */
    public createClient(connectionOptions?: IETCDOptions): void {
        if (!this.client) {
            this.client = new Etcd3(connectionOptions);
            console.log('ETCD client has been created');
        }
    }

    // Override the default configurations with those passed from the user  
    private overrideDefaultConfigs(customConfigs: IETCDConfigurations): IETCDConfigurations {
        customConfigs.moduleConfigs = { ...this.defaultConfigs.moduleConfigs, ...customConfigs.moduleConfigs };
        const overwrittenObject = { ...this.defaultConfigs, ...customConfigs };

        return overwrittenObject;
    }

    /**
     * @description Initialization of `process.env` variable with the data came from the ETCD
     * 
     * @param connectionOptions ETCD connection options
     * @param userDefinedConfigs Custom configurations object
     */
    async initialize(connectionOptions: IETCDOptions, userDefinedConfigs: IETCDConfigurations): Promise<void> {
        try {
            this.proccesedConfigurations = this.overrideDefaultConfigs(userDefinedConfigs);
            this.createClient(connectionOptions);
            this._etcdWatcher = this.client.watch();

            if (!this.proccesedConfigurations.moduleConfigs?.dirname) 
                throw 'ETCD_SERVICE_NAME not found in environment variables';
            if (!this.proccesedConfigurations?.envParams || !Object.keys(this.proccesedConfigurations?.envParams).length)
                throw 'Configs arg does not contains any properties';

            await this.initializeProcess();
        } catch (ex) {
            console.error('initialize() ex:', ex);
        }
    }


    /**
     * @description Getting the setting of an property declared in @IETCDConfigurations if exists
     * @param propertyName Wanted property name
     * @returns The settings in case they exist
     */
    private getPropertySetting(propertyName: string): IETCDPropertyDefenition {
        if (typeof this.proccesedConfigurations.envParams[propertyName] !== "object")
            return undefined;

        return this.proccesedConfigurations.envParams[propertyName] as IETCDPropertyDefenition;
    }


    /**
     * @description Update the env variables (self-managed and process.env)
     * 
     * @param propertyName The propertyName to set in the variables
     * @param val The new value
     */
    private updateEnv(propertyName: string, val: any): void {
        if (this.proccesedConfigurations.moduleConfigs.overrideSysObj) {
            console.log('Update new key in process.env');
            process.env[propertyName] = val;
        }

        // Saving a copy in self-managed object
        this.envParams[propertyName] = val;
    }

    /**
     * @description Watching for key changes in ETCD
     * 
     * @param key The key to watch
     * @param propertyName The propertyName to put in env (or `process.env`)
     */
    private async watchForChanges(key: string | Buffer, propertyName: string): Promise<void> {
        // TODO: Add support for callback per env key
        if (!this._etcdWatcher) throw 'There is no ETCD client, initialization is required';
        
        this._etcdWatcher.key(key).create().then((watcher: Watcher) => {
            watcher.on("put", (kv: IKeyValue, previous?: IKeyValue) => {
                console.log(`Updating the ${key} to:`, kv.value.toString());
                this.updateEnv(propertyName, kv.value.toString());
            });

            watcher.on("delete", async (kv: IKeyValue, previous?: IKeyValue) => {
                console.log(`Deleting param: ${propertyName} from envs`);
                if (this.envParams)
                    delete this.envParams[propertyName];
                
                if (this.proccesedConfigurations.moduleConfigs?.overrideSysObj)
                    delete process.env[propertyName];

                // In case the key deleted,
                await watcher.cancel();
            });
        });
    }

    /**
     * @description Initializing `process.env` property keys, Checking for existence of the properties in the etcd.
     * In case the property exists, set it in the `process.env` object.
     */
     private async initializeProcess(): Promise<void> {
        for (const propertyName of Object.keys(this.proccesedConfigurations?.envParams)) {
            const propertySetting: IETCDPropertyDefenition = this.getPropertySetting(propertyName);
            const generatedEtcdPath: string = `${this.proccesedConfigurations.moduleConfigs.dirname}/${propertyName}`;
            const etcdEntryName: string = propertySetting?.etcdPath || generatedEtcdPath;
            
            // Checking the etcd entry exists. in case it does it will be set, else it will be the defaultValue
            const etcdVal = await this.client.get(etcdEntryName).string();
            const strDefaultVal: string | null | undefined = this.proccesedConfigurations.envParams[propertyName] !== '[object Object]' ?
                this.proccesedConfigurations.envParams[propertyName]?.toString() : undefined;
            
            if (this.proccesedConfigurations.moduleConfigs?.overrideSysObj) {
                process.env[propertyName] = etcdVal || process.env[propertyName] || propertySetting?.defaultValue || strDefaultVal;
                console.log(`process.env[${propertyName}]:`, process.env[propertyName]);
            }

            if (!this.envParams) this.envParams = {};
            this.envParams[propertyName] = etcdVal || process.env[propertyName] || propertySetting?.defaultValue || strDefaultVal;

            if (this.proccesedConfigurations.moduleConfigs?.watchKeys) {
                this.watchForChanges(etcdEntryName, propertyName);
            }

            if (!etcdVal && this.proccesedConfigurations.moduleConfigs?.genKeys) 
                await this.client.put(etcdEntryName).value(process.env[propertyName]);
        }
    }
}

// Module configurations
interface IETCDModuleConfigs {
    /**
     * @description The default "directory" (static-prefix) to search in keys, and save them
     */
    dirname?: string | Buffer;
    
    /**
     * @description Generating the keys if not exists in etcd by the given `defaultValue`. 
     * default false 
     */
    genKeys?: boolean;

    /**
     * @description Override the `process.env.${key}` with the data gathered from etcd. 
     * Otherwise, env will be accessed by `ETCDConfig.envParams`
     */
    overrideSysObj?: boolean;
    
    /**
     * @description Watch the keys for change and update
     */
    watchKeys?: boolean;
}

interface IETCDPropertyDefenition {
    /**
     * @description Custom etcd path to retrive the value from
     */
    etcdPath: string;

    /**
     * @description Default value to put in case it not exists
     */
    defaultValue?: string;
}

export interface IETCDConfigurations {
    moduleConfigs?: IETCDModuleConfigs;
    envParams: {
        // If the value is string, it's the defaultValue
        [propertyName: string]: IETCDPropertyDefenition | string;
    }
}

export interface IEnvParams {
    [keyName: string]: any;
}