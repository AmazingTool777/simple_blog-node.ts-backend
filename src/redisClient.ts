import { createClient } from "redis";

import connectionConfigs from "./configs/redis";

const redisClient = createClient(connectionConfigs.development);

export default redisClient;