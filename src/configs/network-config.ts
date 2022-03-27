// Interface for a network config attributes
interface NetworkConfigAttributes {
    protocol?: 'http' | 'https';
    host?: string | null,
    port?: string | number | null,
    domain?: string | null,
    url?: string | null
}

// Class for a network config
class NetworkConfig implements NetworkConfigAttributes {
    public readonly protocol: "http" | "https" = "http";
    public readonly host: string | null = null;
    public readonly port: string | number | null = null;
    public readonly domain: string | null = null;
    public readonly url: string | null = null;

    constructor(configValues: NetworkConfigAttributes) {
        if (configValues.protocol) this.protocol = configValues.protocol;
        if (configValues.host && configValues.port) {
            this.host = configValues.host;
            this.port = configValues.port;
        }
        this.domain = configValues.domain ? configValues.domain : `${this.host}:${this.port}`;
        this.url = configValues.url ? configValues.url : `${this.protocol}://${this.domain}`;
    }
}

// Development config
const development = new NetworkConfig({
    host: "localhost",
    port: process.env.PORT || 5000
});

export { development };