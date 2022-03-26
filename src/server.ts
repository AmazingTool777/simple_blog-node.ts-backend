import http from "http";

// Express app
import app from "./app";

// Server
const server = http.createServer(app);

// Listening to a PORT
const PORT: string | number = process.env.PORT || 5000;
server.listen(PORT, () => { console.log(`Server running on port ${PORT} ...`); });