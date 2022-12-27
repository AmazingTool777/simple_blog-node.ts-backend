import http from "http";
import { Server } from "socket.io";

// JWT helper
import { jwtVerify } from "./helpers/jwt-helper";

// Socket ids helpers
import { registerUserSocketId } from "./helpers/socketIds"

/* 
** TYPE DEFINITIONS *************************************************
*/

// The socket data
interface SocketData {
    userId?: string | null;
}

/* *************************************************************** */

/**
 * Sets up the sockets related code
 * 
 * @param server The running HTTP server application
 */
export function setupSockets(server: http.Server) {
    const io = new Server<{}, {}, {}, SocketData>(server);

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
            } catch (error) {
                console.log(error);
            }
        }


    })
}