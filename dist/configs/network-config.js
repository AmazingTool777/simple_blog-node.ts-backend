"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.production = exports.development = void 0;
// Class for a network config
class NetworkConfig {
    protocol = "http";
    host = null;
    port = null;
    domain = null;
    url = null;
    constructor(configValues) {
        if (configValues.protocol)
            this.protocol = configValues.protocol;
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
exports.development = development;
// Production config
const production = new NetworkConfig({
    url: "https://distinct-heavy-lighter.glitch.me"
});
exports.production = production;
// The current config
let currentConfig = production;
exports.default = currentConfig;
