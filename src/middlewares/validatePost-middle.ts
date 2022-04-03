import { checkSchema, Schema, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Middleware type
import Middleware from "../@types/Middleware-type";

// App error class
import AppError from "../@types/AppError-class";

// Post schema
const postSchema: Schema = {
    title: {
        notEmpty: true,
        errorMessage: "The title is missing"
    },
    content: {
        notEmpty: true,
        errorMessage: "The content is missing"
    },
    categories: {
        isArray: true,
        isMongoId: true,
        errorMessage: "The values are not valid mongoDB ids"
    }
};

// Post validator middleware
const validatePost: Middleware[] = [
    ...checkSchema(postSchema),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) next(new AppError(400, "There are wrong values", errors.array()));
        else next();
    }
];

export default validatePost;