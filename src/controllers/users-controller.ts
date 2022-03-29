import { Request, Response, NextFunction } from "express";
import { FilterQuery } from "mongoose";

// App error class
import AppError from "../@types/AppError-class";

// User model
import UserModel, { UserAttributes } from "../models/user-model";

// Paginated find
import paginatedFind from "../helpers/paginatedFind-helper";

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


    // Signs up a user
    static async signupUser(req: Request, res: Response, next: NextFunction) {
        try {
            res.send('User signed up');
        }
        catch (error) {
            next(error);
        }
    }

}

export default UsersController;