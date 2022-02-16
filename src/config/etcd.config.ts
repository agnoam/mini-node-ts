import { Etcd3, IOptions as IETCDOptions } from 'etcd3';
import dotenv from 'dotenv';
dotenv.config();

export module ETCDConfig {
    let client: Etcd3 = null;
    let _configs: IETCDConfigurations;
    const defaultConfigs: IETCDConfigurations = {
        envParams: {},
        configs: {
            dirname: process.env.ETCD_SERVICE_NAME
        }
    }

    /**
     * @description This function creates a client to be to communicate with the etcd server
     * @param connectionOptions Connection options by the etcd3 library
     */
    const createClient = (connectionOptions?: IETCDOptions): void => {
        if (!client) {
            client = new Etcd3(connectionOptions);
            console.log('Client created');
        }
    }

    /**
     * @description
     * 
     * @param connectionOptions 
     * @param configs 
     */
    export const initialize = async (connectionOptions: IETCDOptions, configs: IETCDConfigurations): Promise<void> => {
        try {
            _configs = { ...defaultConfigs, ...configs };
            createClient(connectionOptions);

            if (!_configs.configs?.dirname) 
                throw 'ETCD_SERVICE_NAME not found in environment variables';
            if (!_configs?.envParams || !Object.keys(_configs?.envParams).length) 
                throw 'Configs arg does not contains any properties';

            await initializeProcess();
        } catch (ex) {
            console.error('initialize() ex:', ex);
        }
    }


    /**
     * @description
     * @param propertyName 
     * @returns 
     */
    const getPropertySetting = (propertyName: string): IETCDPropertySetting => {
        if (typeof _configs.envParams[propertyName] !== "object")
            return undefined;

        return _configs.envParams[propertyName] as IETCDPropertySetting;
    }

    /**
     * @description Initializing `process.env` property keys
     */
    const initializeProcess = async (): Promise<void> => {
        for (const propertyName of Object.keys(_configs?.envParams)) {
            const propertySetting: IETCDPropertySetting = getPropertySetting(propertyName);
            const generatedEtcdPath: string = `${_configs.configs.dirname}/${propertyName}`;
            const etcdEntryName: string = propertySetting?.etcdPath || generatedEtcdPath;
            
            // Checking the etcd entry exists. in case it does it will be set, else it will be the defaultValue
            const val = await client.get(etcdEntryName).string();
            const strDefaultVal: string = _configs.envParams[propertyName].toString();
            process.env[propertyName] = val || propertySetting?.defaultValue || strDefaultVal;

            if (!val) await client.put(etcdEntryName).value(propertySetting?.defaultValue);
        }
    }
}

interface IETCDSettings {
    // In which directory to look for, and save the generated keys
    dirname?: string | Buffer;
}

interface IETCDPropertySetting {
    etcdPath?: string;
    defaultValue?: string;
}

export interface IETCDConfigurations {
    configs?: IETCDSettings;
    envParams: {
        // If the value is string, it's the defaultValue
        [propertyName: string]: IETCDPropertySetting | string;
    }
}