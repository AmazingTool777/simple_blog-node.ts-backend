"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
// App error class
const AppError_class_1 = __importDefault(require("../@types/AppError-class"));
// User model
const user_model_1 = __importDefault(require("../models/user-model"));
// Update password schema
const updatePasswordSchema = {
    currPassword: {
        notEmpty: {
            errorMessage: "Current password is missing"
        },
        custom: {
            async options(currPassword, { req }) {
                const userHavingEmail = await user_model_1.default.findOne({ _id: req.params?.userId });
                if (!userHavingEmail)
                    throw new Error("User does not exist");
                if (!(await bcrypt_1.default.compare(currPassword, userHavingEmail.password)))
                    throw new Error("Your current password is wrong");
                return true;
            }
        }
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
// Update password validator middleware
const validateUpdatePassword = [
    ...(0, express_validator_1.checkSchema)(updatePasswordSchema),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            next(new AppError_class_1.default(400, "There are wrong values", errors.array()));
        else
            next();
    }
];
exports.default = validateUpdatePassword;
