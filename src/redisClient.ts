import { createClient } from "redis";

import connectionConfigs from "./configs/redis";

const connectionConfig = process.env.NODE_ENV ? connectionConfigs.production : connectionConfigs.development;

const redisClient = createClient(connectionConfig);

export default redisClient;