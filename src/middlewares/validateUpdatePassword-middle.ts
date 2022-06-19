import { checkSchema, Schema, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

// Middleware type
import Middleware from "../@types/Middleware-type";

// App error class
import AppError from "../@types/AppError-class";

// User model
import UserModel from "../models/user-model";

// Update password schema
const updatePasswordSchema: Schema = {
    currPassword: {
        notEmpty: {
            errorMessage: "Current password is missing"
        },
        custom: {
            async options(currPassword, { req }) {
                const userHavingEmail = await UserModel.findOne({ _id: req.params?.userId });
                if (!userHavingEmail) throw new Error("User does not exist");
                if (!(await bcrypt.compare(currPassword as string, userHavingEmail.password)))
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
const validateUpdatePassword: Middleware[] = [
    ...checkSchema(updatePasswordSchema),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) next(new AppError(400, "There are wrong values", errors.array()));
        else next();
    }
];

export default validateUpdatePassword;