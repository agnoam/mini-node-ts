import { injectable } from 'inversify';
import redis, { RedisClient } from 'redis';
import { promisify } from 'util';

@injectable()
export class RedisConfig {
    private redisClient: RedisClient;

    constructor() {
        this.connect();
    }

    asyncCalls() {
        return this.redisClient && {
            get: promisify(this.redisClient.get).bind(this.redisClient),
            set: promisify(this.redisClient.set).bind(this.redisClient)
        }
    }

    connect() {
        try {
            console.log('Connecting to Redis -', process.env.REDIS_HOST);
            this.redisClient = redis.createClient({
                host: process.env.REDIS_HOST || undefined,
                port: +process.env.REDIS_PORT || undefined,
                auth_pass: process.env.REDIS_PASS || undefined
            });
        } catch(ex) {
           console.error('Exception during initializing redis client:', ex);
        }
    }
}