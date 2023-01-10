"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserSocketId = exports.getUserSocketIds = exports.registerUserSocketId = void 0;
// Redis client
const redisClient_1 = __importDefault(require("../redisClient"));
// HELPER: Gets the socket ids key in Redis for the application of a user
function getUserSocketIdsKey(userId) {
    return `simpleblog-user-${userId}-socketids`;
}
// Registers the socket id of a user
async function registerUserSocketId(userId, socketId) {
    await redisClient_1.default.sAdd(getUserSocketIdsKey(userId), socketId);
}
exports.registerUserSocketId = registerUserSocketId;
// Gets the socket ids of a user
async function getUserSocketIds(userId) {
    const key = getUserSocketIdsKey(userId);
    return redisClient_1.default.sMembers(key);
}
exports.getUserSocketIds = getUserSocketIds;
// Removes a user's socket id
async function removeUserSocketId(userId, socketId) {
    const key = getUserSocketIdsKey(userId);
    await redisClient_1.default.sRem(key, socketId);
    // If the user's socket ids list is empty, delete the list
    redisClient_1.default.sCard(key).then((count) => {
        if (count === 0)
            redisClient_1.default.del(key);
    });
}
exports.removeUserSocketId = removeUserSocketId;
