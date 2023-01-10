"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Deletes an api resource's photo
const deleteApiPhoto = (storagePath, apiPath) => {
    return new Promise((resolve, reject) => {
        const filename = apiPath.slice(apiPath.search(/((\w|\d|-)+\.(jpg|jpeg|png|gif|svg))$/));
        fs_1.default.unlink(path_1.default.join(storagePath, filename), (error) => {
            if (error)
                reject(error);
            else
                resolve();
        });
    });
};
exports.default = deleteApiPhoto;
