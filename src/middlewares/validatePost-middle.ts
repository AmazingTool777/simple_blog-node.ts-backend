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
        optional: true,
        isMongoId: {
            errorMessage: "The values are not valid mongoDB ids"
        },
        custom: {
            options(categories, { req }) {
                if (categories.length === 0 && req.body.newCategories && req.body.newCategories.length === 0)
                    throw new Error("You must provide at least 1 category");
            }
        }
    }
};

// Post title and content update validation schema
const postTitleContentValidationSchema: Schema = {
    title: postSchema.title,
    content: postSchema.content,
    postId: {
        in: "params",
        isMongoId: true,
        errorMessage: "The post id is not in a valid mongoDB id format"
    }
}

// Post categories update schema
const postCategoriesUpdateSchema: Schema = {
    categories: postSchema.categories,
    postId: postTitleContentValidationSchema.postId
};

// Validation result handler middleware
const validationResultHandler = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) next(new AppError(400, "There are wrong values", errors.array()));
    else next();
}

// Post validator middleware
const validatePost: Middleware[] = [
    ...checkSchema(postSchema),
    validationResultHandler
];

// Post title and content update validation middleware
const validatePostTitleContentUpdate = [
    ...checkSchema(postTitleContentValidationSchema),
    validationResultHandler
];

// Post categories update validation middleware
const validatePostCategoriesUpdate = [
    ...checkSchema(postCategoriesUpdateSchema),
    validationResultHandler
];

export default validatePost;
export { validatePostTitleContentUpdate, validatePostCategoriesUpdate };