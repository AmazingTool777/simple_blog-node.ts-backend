"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const multer_1 = __importStar(require("multer"));
const uuid_1 = require("uuid");
// App error class
const AppError_class_1 = __importDefault(require("../@types/AppError-class"));
// Returns the image uploader middleware by taking in a few parameters
const imageUploader = (field, storagePath, isArray = false) => {
    // Multer disk storage
    const storage = (0, multer_1.diskStorage)({
        destination: storagePath,
        filename: (req, file, cb) => {
            cb(null, `${file.fieldname}-${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`);
        }
    });
    // Limits
    const limits = { fieldSize: 5000000 }; // 5mb as a maximum size
    // Image filter
    const fileFilter = (req, file, cb) => {
        // Regex pattern for the allowed image extensions
        const allowedExt = /jpg|jpeg|png|gif|svg/i;
        // Checking the correctness of the file extension
        const extIsCorrect = allowedExt.test(path_1.default.extname(file.originalname));
        // Checking the correctness of the file's mimetype
        const mimeTypeIsCorrect = allowedExt.test(file.mimetype);
        if (extIsCorrect && mimeTypeIsCorrect)
            cb(null, true); // Image can be uploaded
        else
            cb(new AppError_class_1.default(400, 'Only images are allowed', undefined)); // File extension is not allowed
    };
    return (req, res, next) => {
        // Multer uploader middleware
        const uploader = isArray
            ? (0, multer_1.default)({ storage, limits, fileFilter }).array(field)
            : (0, multer_1.default)({ storage, limits, fileFilter }).single(field);
        // Uploading
        uploader(req, res, (err) => {
            if (err) {
                if (err instanceof multer_1.MulterError)
                    return next(err); // Upload error
                else
                    return next(new AppError_class_1.default(500, err.message, undefined)); // Unknown error
            }
            if (!req.file)
                return next(new AppError_class_1.default(400, 'You must provide an image', undefined)); // File missing
            next();
        });
    };
};
exports.default = imageUploader;
