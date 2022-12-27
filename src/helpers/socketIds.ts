// Redis client
import redisClient from "../redisClient";

// HELPER: Gets the socket ids key in Redis for the application of a user
function getUserSocketIdsKey(userId: string): string {
    return `simpleblog-user-${userId}-socketids`;
}

// Registers the socket id of a user
export async function registerUserSocketId(userId: string, socketId: string) {
    await redisClient.sAdd(getUserSocketIdsKey(userId), socketId);
}

// Gets the socket ids of a user
export async function getUserSocketIds(userId: string) {
    const key = getUserSocketIdsKey(userId);
    return redisClient.sMembers(key);
}

// Removes a user's socket id
export async function removeUserSocketId(userId: string, socketId: string) {
    const key = getUserSocketIdsKey(userId);
    await redisClient.sRem(key, socketId);
    // If the user's socket ids list is empty, delete the list
    redisClient.sCard(key).then((count) => {
        if (count === 0) redisClient.del(key);
    })
}