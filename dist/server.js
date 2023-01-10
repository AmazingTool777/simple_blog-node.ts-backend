"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
// MongoDb boostrapper
const dbBootstrap_1 = __importDefault(require("./db/dbBootstrap"));
// Express app
const app_1 = __importDefault(require("./app"));
// Sockets setup
const sockets_1 = require("./sockets");
// The redis client
const redisClient_1 = __importDefault(require("./redisClient"));
// Server
const server = http_1.default.createServer(app_1.default);
// Bootstrapping with MongoDb
(0, dbBootstrap_1.default)();
// Listening to a PORT
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { console.log(`Server running on port ${PORT} ...`); });
// Connection to Redis
redisClient_1.default.on("connect", () => console.log("Connected to Redis ..."));
redisClient_1.default.on("error", (error) => console.log("Failed to connect to Redis ...", error));
redisClient_1.default.connect();
// Setting up the sockets related code
(0, sockets_1.setupSockets)(server);
