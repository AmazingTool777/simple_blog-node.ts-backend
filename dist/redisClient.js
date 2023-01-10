"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const redis_2 = __importDefault(require("./configs/redis"));
const connectionConfig = process.env.NODE_ENV ? redis_2.default.production : redis_2.default.development;
const redisClient = (0, redis_1.createClient)(connectionConfig);
exports.default = redisClient;
