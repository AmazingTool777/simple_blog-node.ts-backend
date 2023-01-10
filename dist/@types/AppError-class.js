"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// App error class
class AppError extends Error {
    status;
    message;
    payload;
    constructor(status, message, payload = undefined) {
        super(message);
        this.status = status;
        this.message = message;
        if (payload)
            this.payload = payload;
    }
}
exports.default = AppError;
