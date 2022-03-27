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
    host: "localhost",
    port: 27017
});

export { development };