import { Request, Response, NextFunction } from "express";
import { FilterQuery } from "mongoose";
import bcrypt from "bcrypt";

// App error class
import AppError from "../@types/AppError-class";

// User model
import UserModel, { UserAttributes } from "../models/user-model";

// Paginated find
import paginatedFind from "../helpers/paginatedFind-helper";

// JWT helper methods
import { jwtSign } from "../helpers/jwt-helper";

// Users controller class
class UsersController {

    // Gets users **********************************************************************
    static async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);
            const search = req.query.search as string;
            const filter: FilterQuery<UserAttributes> = {
                $or: [{ firstName: new RegExp(search, "i") }, { lastName: new RegExp(search, "i") }]
            };
            const paginatedUsers = await paginatedFind<UserAttributes>(UserModel, page, limit, { filter });
            res.json(paginatedUsers);
        }
        catch (error) {
            next(error);
        }
    }


    // Gets a user *********************************************************************
    static async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await UserModel.findOne({ _id: req.params.userId });
            if (!user) return next(new AppError(404, "The user is not found"));
            res.json(user);
        }
        catch (error) {
            next(error);
        }
    }


    // Signs up a user *****************************************************************
    static async signupUser(req: Request, res: Response, next: NextFunction) {
        try {
            // Getting the hashed password
            const hashedPassword = await bcrypt.hash(req.body.password as string, 10);

            // Storing the user to db
            const newUserDocument = new UserModel({
                firstName: req.body.firstName as string,
                lastName: req.body.lastName as string,
                gender: req.body.gender as string,
                email: req.body.email as string,
                password: hashedPassword,
            });
            const addedUser = await newUserDocument.save();

            // Signing the user with JWT
            const token = await jwtSign({ userdId: addedUser._id }, "user", 3600 * 24);

            res.send({ token, user: addedUser });
        }
        catch (error) {
            next(error);
        }
    }

}

export default UsersController;