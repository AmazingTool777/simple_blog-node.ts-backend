import { checkSchema, Schema, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Middleware type
import Middleware from "../@types/Middleware-type";

// App error class
import AppError from "../@types/AppError-class";

// Signup user schema
const signupUserSchema: Schema = {
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
const validateSignupUser: Middleware[] = [
    ...checkSchema(signupUserSchema),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) next(new AppError(400, "There are wrong values", errors.array()));
        else next();
    }
];

export default validateSignupUser;