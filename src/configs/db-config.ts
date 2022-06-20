import path from "path"
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../", "../", ".env") });

// Interface for environment database config
interface DbConfigAttributes {
    dbName: string;
    host?: string | null,
    port?: string | number | null,
    domain?: string | null,
    username?: string | null,
    password?: string | null,
    uri?: string | null
}

// Class for the environment database config
class DbConfig implements DbConfigAttributes {
    public readonly dbName!: string;
    public readonly host: string | null = null;
    public readonly port: string | number | null = null;
    public readonly domain: string | null = null;
    public readonly username: string | null = null;
    public readonly password: string | null = null;
    public readonly uri: string | null = null;

    constructor(configValues: DbConfigAttributes) {
        this.dbName = configValues.dbName;
        if (configValues.host && configValues.port) {
            this.host = configValues.host;
            this.port = configValues.port;
        }
        if (configValues.domain) this.domain = configValues.domain;
        if (configValues.username && configValues.password) {
            this.username = configValues.username;
            this.password = configValues.password;
        }
        if (configValues.uri) this.uri = configValues.uri;
    }

    getURI() {
        if (this.uri) return this.uri;
        let DOMAIN = this.domain ? this.domain : `${this.host}:${this.port}`;
        if (this.username) DOMAIN = `${this.username}:${this.password}@${DOMAIN}`;
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

// Database config for production
const production = new DbConfig({
    dbName: "simple-blog",
    uri: process.env.ATLAS_DB_URI
});

export { development, production };