"use strict";
// import path from "path"
// import * as dotenv from "dotenv";
Object.defineProperty(exports, "__esModule", { value: true });
exports.production = exports.development = void 0;
// Class for the environment database config
class DbConfig {
    dbName;
    host = null;
    port = null;
    domain = null;
    username = null;
    password = null;
    uri = null;
    constructor(configValues) {
        this.dbName = configValues.dbName;
        if (configValues.host && configValues.port) {
            this.host = configValues.host;
            this.port = configValues.port;
        }
        if (configValues.domain)
            this.domain = configValues.domain;
        if (configValues.username && configValues.password) {
            this.username = configValues.username;
            this.password = configValues.password;
        }
        if (configValues.uri)
            this.uri = configValues.uri;
    }
    getURI() {
        if (this.uri)
            return this.uri;
        let DOMAIN = this.domain ? this.domain : `${this.host}:${this.port}`;
        if (this.username)
            DOMAIN = `${this.username}:${this.password}@${DOMAIN}`;
        const URI = `mongodb://${DOMAIN}/${this.dbName}`;
        return URI;
    }
}
// Database config for development
const development = new DbConfig({
    dbName: "simple-blog",
    host: "127.0.0.1",
    port: 27017
});
exports.development = development;
// Database config for production
const production = new DbConfig({
    dbName: "simple-blog",
    uri: process.env.ATLAS_DB_URI
});
exports.production = production;
