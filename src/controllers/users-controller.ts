import { Request, Response, NextFunction } from "express";
import { FilterQuery } from "mongoose";

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

}

export default UsersController;