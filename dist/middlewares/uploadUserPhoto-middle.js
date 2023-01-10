"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Storage path for user photos
const photos_config_1 = require("../configs/photos-config");
// Image uploader middleware
const imageUploader_middle_1 = __importDefault(require("./imageUploader-middle"));
// User photo uploader middleware
const uploadUserPhoto = (req, res, next) => {
    (0, imageUploader_middle_1.default)("photo", photos_config_1.usersPhotoConfig.storagePath)(req, res, next);
};
exports.default = uploadUserPhoto;
