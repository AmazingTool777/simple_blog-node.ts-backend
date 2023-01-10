"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
// App error class
const AppError_class_1 = __importDefault(require("../@types/AppError-class"));
// Comment schema
const commentSchema = {
    content: {
        notEmpty: true,
        errorMessage: 'Comment content is required',
        trim: true
    },
};
// Update user validator middleware
const validateComment = [
    ...(0, express_validator_1.checkSchema)(commentSchema),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            next(new AppError_class_1.default(400, "There are wrong values", errors.array()));
        else
            next();
    }
];
exports.default = validateComment;
