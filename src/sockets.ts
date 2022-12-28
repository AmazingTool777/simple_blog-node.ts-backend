import http from "http";
import { Server } from "socket.io";
import { Document, Types } from "mongoose";

// JWT helper
import { jwtVerify } from "./helpers/jwt-helper";

// Socket ids helpers
import { registerUserSocketId, getUserSocketIds, removeUserSocketId } from "./helpers/socketIds";

// Actions event emitters
import actionsEventEmitter from "./actionsEventEmitter";

// Model attributes
import { type UserAttributes } from "./models/user-model";
import { type PostAttributes } from "./models/post-model";
import { type FollowingAttributes } from "./models/following-model";
import { type LikeAttributes } from "./models/like-model";
import { type CommentAttributes } from "./models/comment-model";

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

    post_comment: (notification: PostCommentNotification) => void;

    comment_added: (data: PostCommentNotification) => void;

    comment_modified: (
        data: {
            comment: CommentDocument,
            post: PostDocument,
            user: UserDocument,
        }
    ) => void;

    comment_deleted: (data: { commentId: Types.ObjectId }) => void;
}

interface ClientToServerEvents {
    post_view: (postId: string) => void;

    post_leave: (postId: string) => void;
}

interface SocketData {
    userId?: string | null;
}

interface NotificationData<Payload = undefined> {
    message: string;
    payload?: Payload
}

type PostCommentNotification = NotificationData<{
    comment: CommentDocument,
    post: PostDocument,
    user: UserDocument
}>

// Transform a model attributes to its document type
type ModelAttributesToDocument<ModelAttributes> = (Document<unknown, any, ModelAttributes> & ModelAttributes & {
    _id: Types.ObjectId;
})

type UserDocument = ModelAttributesToDocument<UserAttributes>;

type PostDocument = ModelAttributesToDocument<PostAttributes>;

type FollowingDocument = ModelAttributesToDocument<FollowingAttributes>;

type LikeDocument = ModelAttributesToDocument<LikeAttributes>;

type CommentDocument = ModelAttributesToDocument<CommentAttributes>;

/* *************************************************************** */

/**
 * Sets up the sockets related code
 * 
 * @param server The running HTTP server application
 */
export function setupSockets(server: http.Server) {
    const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(server);

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

        // When a user views a post, make the user's socket join the post's room
        socket.on("post_view", (postId: string) => {
            socket.join(getPostRoom(postId));
        });

        // When a user leaves a post's page, make the user's socket leave the post's room
        socket.on("post_leave", (postId: string) => {
            socket.leave(getPostRoom(postId));
        });

        socket.on("disconnect", async () => {
            // If an authenticated user was attached to the socket,
            // remove the socket id of that user from the Redis cache
            if (userId) {
                await removeUserSocketId(userId, socket.id);
            }
        });
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

    // Comment added
    actionsEventEmitter.on("comment_added", async (comment: CommentDocument, post: PostDocument, user: UserDocument) => {
        const authorSocketIds = await getUserSocketIds(post.author.toString());
        const newCommentNotification = {
            message: `${user.firstName} ${user.lastName} commented on your post: ${post.title}`,
            payload: {
                comment,
                post,
                user
            }
        }
        // Emitting the post comment notification to the author of the post
        for (const socketId of authorSocketIds) {
            io.to(socketId).emit("post_comment", newCommentNotification);
        }
        // Emitting the comment added event to all users viewing the post
        io.to(getPostRoom(post._id.toString())).emit("comment_added", newCommentNotification);
    });

    // Comment updated
    actionsEventEmitter.on("comment_updated", async (comment: CommentDocument, post: PostDocument, user: UserDocument) => {
        // Emitting the comment modified event to all users viewing the post
        io.to(getPostRoom(post._id.toString())).emit("comment_modified", {
            comment,
            post,
            user
        });
    });

    // Comment deleted
    actionsEventEmitter.on("comment_deleted", async (commentId: Types.ObjectId, postId: string) => {
        // Emitting the comment modified event to all users viewing the post
        io.to(getPostRoom(postId)).emit("comment_deleted", {
            commentId,
        });
    });

    /* *********************************************************** */
}

// HELPER: Gets the name of a post's room
function getPostRoom(postId: string) {
    return `simpleblog-post-${postId}`;
}