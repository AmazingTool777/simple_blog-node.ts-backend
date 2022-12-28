import http from "http";
import { Server } from "socket.io";
import { Document, Types } from "mongoose";

// JWT helper
import { jwtVerify } from "./helpers/jwt-helper";

// Socket ids helpers
import { registerUserSocketId, getUserSocketIds } from "./helpers/socketIds";

// Actions event emitters
import actionsEventEmitter from "./actionsEventEmitter";

// Model attributes
import { type UserAttributes } from "./models/user-model";
import { type PostAttributes } from "./models/post-model";
import { type FollowingAttributes } from "./models/following-model";
import { type LikeAttributes } from "./models/like-model";

/* 
** TYPE DEFINITIONS *************************************************
*/

interface ServerToClientEvents {
    new_follower: (notification: NotificationData<{ following: FollowingDocument }>) => void;

    post_like: (
        notification: NotificationData<{
            user: UserDocument,
            post: PostDocument,
            like: LikeDocument
        }>
    ) => void;

    new_post: (
        notification: NotificationData<{
            author: UserDocument,
            post: PostDocument,
        }>
    ) => void;
}

interface SocketData {
    userId?: string | null;
}

interface NotificationData<Payload = undefined> {
    message: string;
    payload?: Payload
}

// Transform a model attributes to its document type
type ModelAttributesToDocument<ModelAttributes> = (Document<unknown, any, ModelAttributes> & ModelAttributes & {
    _id: Types.ObjectId;
})

type UserDocument = ModelAttributesToDocument<UserAttributes>;

type PostDocument = ModelAttributesToDocument<PostAttributes>;

type FollowingDocument = ModelAttributesToDocument<FollowingAttributes>;

type LikeDocument = ModelAttributesToDocument<LikeAttributes>;

/* *************************************************************** */

/**
 * Sets up the sockets related code
 * 
 * @param server The running HTTP server application
 */
export function setupSockets(server: http.Server) {
    const io = new Server<{}, ServerToClientEvents, {}, SocketData>(server);

    // Middleware for authenticating the sockets
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token as string | null;
        let payload: { userId: string } | null = null;
        if (token) {
            try {
                payload = await jwtVerify(token, "user") as { userId: string };
            } catch (error) {
                return next(new Error("The token is invalid"));
            }
        }
        socket.data = {
            userId: payload && payload.userId
        }
        next();
    });

    // Upon a new socket connection
    io.on("connection", (socket) => {
        console.log("A new socket is connected ...");

        // Registering the authenticated user's socket id
        const { userId } = socket.data;
        if (userId) {
            try {
                registerUserSocketId(userId, socket.id);
            } catch (err) {
                const error = err as Error;
                console.log("Failed to register the user's socket id", error.message);
            }
        }
    });

    /* 
    ** Subscriptions to http actions ********************************
    */

    // Following subscription
    actionsEventEmitter.on("following_added", async (follower: UserDocument, following: FollowingDocument) => {
        const followedUserSocketIds = await getUserSocketIds(following.followedUser.toString());
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
    actionsEventEmitter.on("like_added", async (post: PostDocument, like: LikeDocument, user: UserDocument) => {
        const authorSocketIds = await getUserSocketIds(post.author.toString());
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
    actionsEventEmitter.on("post_added", async (post: PostDocument, author: UserDocument, followers: UserDocument[]) => {
        const notification = {
            message: `${author.firstName} ${author.lastName} published a post: ${post.title}`,
            payload: {
                post,
                author
            }
        }
        for (const follower of followers) {
            getUserSocketIds(follower._id.toString())
                .then(socketIds => {
                    for (const socketId of socketIds) {
                        io.to(socketId).emit("new_post", notification);
                    }
                })
        }
    });

    /* *********************************************************** */
}