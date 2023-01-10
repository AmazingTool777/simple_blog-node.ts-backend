"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
// App error class
const AppError_class_1 = __importDefault(require("../@types/AppError-class"));
// Update user schema
const updateUserSchema = {
    firstName: {
        notEmpty: true,
        errorMessage: 'First name is required',
        trim: true
    },
    lastName: {
        notEmpty: true,
        errorMessage: 'Last name is required',
        trim: true
    },
    email: {
        notEmpty: true,
        trim: true,
        isEmail: true,
        errorMessage: 'Email address is not valid'
    }
};
// Update user validator middleware
const validateUpdateUser = [
    ...(0, express_validator_1.checkSchema)(updateUserSchema),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            next(new AppError_class_1.default(400, "There are wrong values", errors.array()));
        else
            next();
    }
];
exports.default = validateUpdateUser;
