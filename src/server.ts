import http from "http";

// MongoDb boostrapper
import bootstrapDb from "./db/dbBootstrap";

// Express app
import app from "./app";

// Sockets setup
import { setupSockets } from "./sockets";

// Server
const server = http.createServer(app);

// Bootstrapping with MongoDb
bootstrapDb();

// Listening to a PORT
const PORT: string | number = process.env.PORT || 5000;
server.listen(PORT, () => { console.log(`Server running on port ${PORT} ...`); });

// Setting up the sockets related code
setupSockets(server);