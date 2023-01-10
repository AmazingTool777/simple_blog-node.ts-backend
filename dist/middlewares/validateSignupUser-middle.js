"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
// App error class
const AppError_class_1 = __importDefault(require("../@types/AppError-class"));
// Signup user schema
const signupUserSchema = {
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
    gender: {
        notEmpty: true,
        trim: true,
        toUpperCase: true,
        matches: { options: /^([M|F]{1})$/ },
        errorMessage: "Gender must be either 'M' or 'F'"
    },
    email: {
        notEmpty: true,
        trim: true,
        isEmail: true,
        errorMessage: 'Email address is not valid'
    },
    password: {
        notEmpty: true,
        trim: true,
        isLength: {
            options: {
                min: 5
            }
        },
        errorMessage: "Password must be at least 5 characters"
    }
};
// Signup user validator middleware
const validateSignupUser = [
    ...(0, express_validator_1.checkSchema)(signupUserSchema),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            next(new AppError_class_1.default(400, "There are wrong values", errors.array()));
        else
            next();
    }
];
exports.default = validateSignupUser;
