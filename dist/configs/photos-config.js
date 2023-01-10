"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsPhotoConfig = exports.usersPhotoConfig = void 0;
const path_1 = __importDefault(require("path"));
// Photo config for the users'photos
const usersPhotoConfig = {
    storagePath: path_1.default.join(__dirname, "../", "../", "static", "users"),
    urlPath: "/public/users"
};
exports.usersPhotoConfig = usersPhotoConfig;
// Photo config for the posts'photos
const postsPhotoConfig = {
    storagePath: path_1.default.join(__dirname, "../", "../", "static", "posts"),
    urlPath: "/public/posts"
};
exports.postsPhotoConfig = postsPhotoConfig;
