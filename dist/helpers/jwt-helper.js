"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtVerify = exports.jwtSign = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// JWT signer
const jwtSign = (payload, secretKey = "SecretKey", expiresIn) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn }, (error, hash) => {
            if (error)
                reject(error);
            else if (hash)
                resolve(hash);
        });
    });
};
exports.jwtSign = jwtSign;
// JWT verifier
const jwtVerify = (hash, secretKey = 'SecretKey') => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(hash, secretKey, (error, payload) => {
            if (error)
                reject(error);
            else if (payload)
                resolve(payload);
        });
    });
};
exports.jwtVerify = jwtVerify;
