import http from "http";
import { Server } from "socket.io";

/**
 * Sets up the sockets related code
 * 
 * @param server The running HTTP server application
 */
export function setupSockets(server: http.Server) {
    const io = new Server<{}, {}, {}, {}>(server);

    io.on("connection", () => {
        console.log("Sockets can connect successfully ...");
    })
}