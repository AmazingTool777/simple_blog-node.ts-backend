"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connectionConfigs = {
    development: {
        url: "redis://localhost:6379"
    },
    production: {
        url: `redis://${process.env.REDIS_ENDPOINT_URL}`,
        password: process.env.REDIS_PASSWORD
    },
};
exports.default = connectionConfigs;
