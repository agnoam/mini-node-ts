import { injectable } from "inversify";
import { Client, ClientOptions } from '@elastic/elasticsearch';
import { Delete, Index, Search, Update } from "@elastic/elasticsearch/api/requestParams";
import { ApiResponse, TransportRequestOptions, TransportRequestPromise } from "@elastic/elasticsearch/lib/Transport";

const defaultClientParams: IConnectionParams = {
    node: [process.env.ELASTICSEARCH_HOSTS] || ['http://localhost:9200']
} 

@injectable()
export class DbDriver implements IDbDriver {
    client: Client;
    
    constructor() {
        this.connect();
    }

    connect(connectionParams?: IConnectionParams) {
        if (!this.client) {
            this.client = new Client({ ...defaultClientParams, ...connectionParams });
        }

        console.log('A connection is established already');
    }

    async search(params?: Search<Record<string, any>>, options?: TransportRequestOptions): Promise<ApiResponse<any, any>> {
        if (!this.client) this.connect()
        return await this.client.search(params, options);
    }

    async insert(
        params?: Index<Record<string, any>>, 
        options?: TransportRequestOptions
    ): Promise<ApiResponse<Record<string, any>, unknown>> {
        if (!this.client) this.connect();
        return await this.client.index(params, options);
    }

    async update(
        params?: Update<Record<string, any>>, 
        options?: TransportRequestOptions
    ): Promise<ApiResponse<Record<string, any>, unknown>> {
        if (!this.client) this.connect();
        return await this.client.update(params, options);
    }

    async delete(params?: Delete, options?: TransportRequestOptions): Promise<ApiResponse<Record<string, any>, unknown>> {
        if (!this.client) this.connect();
        return await this.client.delete(params, options);
    }
}

export interface IConnectionParams extends ClientOptions {}
export interface IDataInsertConfig {}
export interface IUpdateObject {}
export interface IDeleteConfig {}
export interface IDbDriver {
    connect(connectionParams?: IConnectionParams): void;
    search(params?: Search<Record<string, any>>, options?: TransportRequestOptions): Promise<ApiResponse<any, any>>;
    insert(params?: Index<Record<string, any>>, options?: TransportRequestOptions): Promise<ApiResponse<Record<string, any>, unknown>>;
    update(params?: Update<Record<string, any>>, options?: TransportRequestOptions): Promise<ApiResponse<Record<string, any>, unknown>>;
    delete(params?: Delete, options?: TransportRequestOptions): Promise<ApiResponse<Record<string, any>, unknown>>;
}