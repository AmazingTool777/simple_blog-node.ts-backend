import { checkSchema, Schema, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Middleware type
import Middleware from "../@types/Middleware-type";

// App error class
import AppError from "../@types/AppError-class";

// Update user schema
const updateUserSchema: Schema = {
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
const validateUpdateUser: Middleware[] = [
    ...checkSchema(updateUserSchema),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) next(new AppError(400, "There are wrong values", errors.array()));
        else next();
    }
];

export default validateUpdateUser;