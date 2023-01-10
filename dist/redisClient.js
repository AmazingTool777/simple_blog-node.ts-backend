"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const redis_2 = __importDefault(require("./configs/redis"));
const redisClient = (0, redis_1.createClient)(redis_2.default.development);
exports.default = redisClient;
