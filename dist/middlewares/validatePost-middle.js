"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePostCategoriesUpdate = exports.validatePostTitleContentUpdate = void 0;
const express_validator_1 = require("express-validator");
// App error class
const AppError_class_1 = __importDefault(require("../@types/AppError-class"));
// Post schema
const postSchema = {
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
        // custom: {
        //     options(categories, { req }) {
        //         console.log(categories, req.body.newCategories);
        //         if (!categories && !req.body.newCategories)
        //             throw new Error("You must provide at least 1 category");
        //         else {
        //             console.log("Should be success");
        //             return Promise.resolve();
        //         }
        //     }
        // }
    }
};
// Post title and content update validation schema
const postTitleContentValidationSchema = {
    title: postSchema.title,
    content: postSchema.content,
    postId: {
        in: "params",
        isMongoId: true,
        errorMessage: "The post id is not in a valid mongoDB id format"
    }
};
// Post categories update schema
const postCategoriesUpdateSchema = {
    categories: postSchema.categories,
    postId: postTitleContentValidationSchema.postId
};
// Validation result handler middleware
const validationResultHandler = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        next(new AppError_class_1.default(400, "There are wrong values", errors.array()));
    else
        next();
};
// Post validator middleware
const validatePost = [
    ...(0, express_validator_1.checkSchema)(postSchema),
    validationResultHandler
];
// Post title and content update validation middleware
const validatePostTitleContentUpdate = [
    ...(0, express_validator_1.checkSchema)(postTitleContentValidationSchema),
    validationResultHandler
];
exports.validatePostTitleContentUpdate = validatePostTitleContentUpdate;
// Post categories update validation middleware
const validatePostCategoriesUpdate = [
    ...(0, express_validator_1.checkSchema)(postCategoriesUpdateSchema),
    validationResultHandler
];
exports.validatePostCategoriesUpdate = validatePostCategoriesUpdate;
exports.default = validatePost;
