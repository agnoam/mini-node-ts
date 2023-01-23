import { Client, RequestParams } from '@elastic/elasticsearch';

console.log('import elasticsearch.config');

// class ArchiveService {
//     constructor(archiveConfig, logger, tracer) {
//         this._config = archiveConfig;
//         this._client = new Client({
            
//         });
//         this._logger = logger;
//         this._tracer = tracer;
//     }

//     async createMappingIndexIfNotExist(indexName, typeName, mappingBody, parentSpan) {
//         const logObj = {
//             prefix: `${this.constructor.name} - ${this.createMappingIndexIfNotExist.name}`,
//             sw: new Stopwatch(true),
//             isError: false,
//             msg: 'success',
//         };
//         const span = this._tracer.startSpan(logObj.prefix, { childOf: parentSpan });
//         try {
//             const isIndexExists = this._client.indices.exists({ index: indexName });
//             if (!isIndexExists.body) {
//                 this._logger.log('info', `${logObj.prefix} index ${indexName} does not exist. creating new index.`);
//                 await this._client.indices.create({
//                     index: indexName,
//                     body: {
//                         // number_of_replicas: 1,
//                         // number_of_shards: 15
//                     },
//                 });
//                 await this.createMapping(indexName, this._docType, mappingBody, span);
//             } else {
//                 this._logger.log('info', `${logObj.prefix} index ${indexName} already exist.`);
//             }
//         } catch (error) {
//             span.setTag(opentracing.Tags.ERROR, true);
//             logObj.isError = true;
//             logObj.msg = `createIndex ${indexName} error: ${error.message}`;
//             throw error;
//         } finally {
//             this._logger.log(
//                 logObj.isError ? 'error' : 'info',
//                 `${logObj.prefix} - ${logObj.msg}`,
//                 span,
//                 `time: ${logObj.sw.stop() / 1000}`
//             );
//             span.finish();
//         }
//     }

//     async createMapping(indexName, typeName, mappingBody, parentSpan) {
//         const logObj = {
//             prefix: `${this.constructor.name} - ${this.createMapping.name}`,
//             sw: new Stopwatch(true),
//             isError: false,
//             msg: 'success',
//         };
//         const span = this._tracer.startSpan(logObj.prefix, { childOf: parentSpan });
//         try {
//             this._logger.log('info', `${logObj.prefix} creating mapping.`);
//             await this._client.indices.putMapping({
//                 index: indexName,
//                 body: mappingBody,
//             });
//         } catch (error) {
//             span.setTag(opentracing.Tags.ERROR, true);
//             logObj.isError = true;
//             logObj.msg = `createIndex ${indexName} error: ${error.message}`;
//             throw error;
//         } finally {
//             this._logger.log(
//                 logObj.isError ? 'error' : 'info',
//                 `${logObj.prefix} - ${logObj.msg}`,
//                 span,
//                 `time: ${logObj.sw.stop() / 1000}`
//             );
//             span.finish();
//         }
//     }
// };

export module ElasticSerachConfig {
    export const elasticClient: Client = new Client({
        node: process.env.ELASTICSEARCH_URI,
        maxRetries: +process.env.ELASTICSEARCH_MAX_RETRIES,
        requestTimeout: +process.env.ELASTICSEARCH_REQUEST_TIMEOUT
    });
    console.log('Elasticsearch client created');
    
    const logsMappings = {
        // [index-name]: Elasticsearch mapping object
        logs: {
            body: {
                dynamic: 'strict',
                properties: {
                    // FIXME: This field is requiredb
                    name: { 
                        type : "text",
                        fields : {
                            keyword : {
                                type: "keyword",
                                ignore_above: 50
                            }
                        }
                    },
                    // FIXME: This field is required
                    profileImageUrl: { type: "keyword" },
                    biography: { 
                        type: "text",
                        analyzer: "engilsh"
                    },
                    lastIndexDate: { 
                        // Add pipeline updates this field within every update
                        type: "date" 
                    },
                    relatedData: {
                        type: "nested",
                        properties: {
                            /* V1 of `relatedData` nested obj
                                {
                                    docs: { type: "keyword" },
                                    photos: { type: "keyword" },
                                    videos: { type: "keyword" }
                                }
                            */
                            docs: {
                                type: "nested",
                                properties: {
                                    fileURL: { type: "keyword" },
                                    indexedContent: { type: "text" }
                                }
                            },
                            photos: { 
                                // In case there is properties key without type -> default type is `object`
                                properties: {
                                    photoURL: { type: "keyword" },
                                    faceLocation: {
                                        properties: {
                                            // FIXME: All fields required
                                            xTop: { "type": "integer" },
                                            yTop: { "type": "integer" },
                                            xBottom: { "type": "integer" },
                                            yBottom: { "type": "integer" }
                                        }
                                    }
                                }
                            },
                            videos: { type: "keyword" }
                        }
                    }
                }
            }
        }
    }

    export const initialize = (data: InitializationInput): void => {
        console.log('Initializing elasticsearch client...');

        // Initializing all indices mappings (db-models)
        for (const indexName of Object.keys(data.mappings)) {
            if (elasticClient.indices.exists({ index: indexName })) {
                console.log(`Creating ${indexName} index`);
                
                try {
                    const indexMappingObj = data.mappings[indexName];
                    const mapping: RequestParams.IndicesPutMapping<Record<string, any>> = { 
                        index: `${data.dbName}-${indexName}`, ...indexMappingObj 
                    }
        
                    elasticClient.indices.putMapping(mapping);
                } catch(ex) {
                    console.error(`Failed to create index: ${indexName}`, ex);
                }
            }
        }
    }

    export enum IndicesNames {
        Entities = 'entities'
    }

    interface IDoc {
        fileURL: string; 
        indexedContent: string; 
    }

    interface IPhoto {
        photoURL: string;
        faceLocation: {
            xTop: number;
            yTop: number;
            xBottom: number;
            yBottom: number;
        }
    }

    interface IEntity {
        name: string;
        profileImageUrl: string;
        biography: string;
        lastIndexDate: number;
        relatedData: {
            docs: IDoc[];
            photos: IPhoto[];
            videos: string[];
        }
    }

    export interface InitializationInput {
        dbName: string;
        mappings: {
            // value is: Mapping object
            [indexName: string]: RequestParams.IndicesPutMapping<Record<string, any>>;
        }
    }
}