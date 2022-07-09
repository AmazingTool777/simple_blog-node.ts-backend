import { checkSchema, Schema, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Middleware type
import Middleware from "../@types/Middleware-type";

// App error class
import AppError from "../@types/AppError-class";

// Comment schema
const commentSchema: Schema = {
    comment: {
        notEmpty: true,
        errorMessage: 'Comment content is required',
        trim: true
    },
};

// Update user validator middleware
const validateComment: Middleware[] = [
    ...checkSchema(commentSchema),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) next(new AppError(400, "There are wrong values", errors.array()));
        else next();
    }
];

export default validateComment;