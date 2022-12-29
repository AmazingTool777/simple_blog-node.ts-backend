import { RedisClientOptions } from "redis";

const connectionConfigs: Record<"development" | "production", RedisClientOptions> = {
    development: {
        url: "redis://localhost:6379"
    },
    production: {
        url: `redis://${process.env.REDIS_ENDPOINT_URL}`,
        password: process.env.REDIS_PASSWORD
    },
}

export default connectionConfigs;