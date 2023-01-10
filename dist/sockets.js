"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSockets = void 0;
const socket_io_1 = require("socket.io");
// JWT helper
const jwt_helper_1 = require("./helpers/jwt-helper");
// Socket ids helpers
const socketIds_1 = require("./helpers/socketIds");
// Actions event emitters
const actionsEventEmitter_1 = __importDefault(require("./actionsEventEmitter"));
/* *************************************************************** */
/**
 * Sets up the sockets related code
 *
 * @param server The running HTTP server application
 */
function setupSockets(server) {
    const io = new socket_io_1.Server(server);
    // Middleware for authenticating the sockets
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        let payload = null;
        if (token) {
            try {
                payload = await (0, jwt_helper_1.jwtVerify)(token, "user");
            }
            catch (error) {
                return next(new Error("The token is invalid"));
            }
        }
        socket.data = {
            userId: payload && payload.userId
        };
        next();
    });
    // Upon a new socket connection
    io.on("connection", (socket) => {
        console.log("A new socket is connected ...");
        // Registering the authenticated user's socket id
        const { userId } = socket.data;
        if (userId) {
            try {
                (0, socketIds_1.registerUserSocketId)(userId, socket.id);
            }
            catch (err) {
                const error = err;
                console.log("Failed to register the user's socket id", error.message);
            }
        }
        // When a user views a post, make the user's socket join the post's room
        socket.on("post_view", (postId) => {
            socket.join(getPostRoom(postId));
        });
        // When a user leaves a post's page, make the user's socket leave the post's room
        socket.on("post_leave", (postId) => {
            socket.leave(getPostRoom(postId));
        });
        // When a user's writing a comment, also notify all other users that are viewing the post about that event
        socket.on("user_commenting", (postId) => {
            socket.broadcast.to(getPostRoom(postId)).emit("user_commenting", postId);
        });
        socket.on("disconnect", async () => {
            // If an authenticated user was attached to the socket,
            // remove the socket id of that user from the Redis cache
            if (userId) {
                await (0, socketIds_1.removeUserSocketId)(userId, socket.id);
            }
        });
    });
    /*
    ** Subscriptions to http actions ********************************
    */
    // Following subscription
    actionsEventEmitter_1.default.on("following_added", async (follower, following) => {
        const followedUserSocketIds = await (0, socketIds_1.getUserSocketIds)(following.followedUser.toString());
        const notification = {
            message: `${follower.firstName} ${follower.lastName} started following you`,
            payload: {
                following
            }
        };
        for (const socketId of followedUserSocketIds) {
            io.to(socketId).emit("new_follower", notification);
        }
    });
    // Like on a post
    actionsEventEmitter_1.default.on("like_added", async (post, like, user) => {
        const authorSocketIds = await (0, socketIds_1.getUserSocketIds)(post.author.toString());
        const notification = {
            message: `${user.firstName} ${user.lastName} liked your post: ${post.title}`,
            payload: {
                post,
                like,
                user
            }
        };
        for (const socketId of authorSocketIds) {
            io.to(socketId).emit("post_like", notification);
        }
    });
    // Published post to followers
    actionsEventEmitter_1.default.on("post_added", async (post, author, followers) => {
        const notification = {
            message: `${author.firstName} ${author.lastName} published a post: ${post.title}`,
            payload: {
                post,
                author
            }
        };
        for (const follower of followers) {
            (0, socketIds_1.getUserSocketIds)(follower._id.toString())
                .then(socketIds => {
                for (const socketId of socketIds) {
                    io.to(socketId).emit("new_post", notification);
                }
            });
        }
    });
    // Comment added
    actionsEventEmitter_1.default.on("comment_added", async (comment, post, user) => {
        const authorSocketIds = await (0, socketIds_1.getUserSocketIds)(post.author.toString());
        const newCommentNotification = {
            message: `${user.firstName} ${user.lastName} commented on your post: ${post.title}`,
            payload: {
                comment,
                post,
                user
            }
        };
        // Emitting the post comment notification to the author of the post
        for (const socketId of authorSocketIds) {
            io.to(socketId).emit("post_comment", newCommentNotification);
        }
        // Emitting the comment added event to all users viewing the post
        io.to(getPostRoom(post._id.toString())).emit("comment_added", newCommentNotification);
    });
    // Comment updated
    actionsEventEmitter_1.default.on("comment_updated", async (comment, post, user) => {
        // Emitting the comment modified event to all users viewing the post
        io.to(getPostRoom(post._id.toString())).emit("comment_modified", {
            comment,
            post,
            user
        });
    });
    // Comment deleted
    actionsEventEmitter_1.default.on("comment_deleted", async (commentId, postId) => {
        // Emitting the comment modified event to all users viewing the post
        io.to(getPostRoom(postId)).emit("comment_deleted", {
            commentId,
        });
    });
    /* *********************************************************** */
}
exports.setupSockets = setupSockets;
// HELPER: Gets the name of a post's room
function getPostRoom(postId) {
    return `simpleblog-post-${postId}`;
}
