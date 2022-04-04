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

// Api photo deleter
import deleteApiPhoto from "../helpers/deleteApiPhoto-helper";

// User photo config
import { usersPhotoConfig } from "../configs/photos-config";

// Users controller class
class UsersController {

    // Gets users **********************************************************************
    static async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);
            const search = req.query.search ? decodeURI(req.query.search as string) : "";
            const filter: FilterQuery<UserAttributes> = {
                $or: [{ firstName: new RegExp(search, "i") }, { lastName: new RegExp(search, "i") }]
            };
            const sort = (!req.query.order || (req.query.order as string) === "asc" ? "" : "-") + "createdAt";
            const paginatedUsers = await paginatedFind<UserAttributes>(UserModel, page, limit, { filter, sort });
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


    // Updates a user's photo
    static async updateUserPhoto(req: Request, res: Response, next: NextFunction) {
        try {
            // Searching if the user exists
            const user = await UserModel.findById(req.params.userId);
            if (!user) return next(new AppError(404, "The user does not exist"));

            // Deleting user photo from files
            if (user.photoPath) deleteApiPhoto(usersPhotoConfig.storagePath, user.photoPath);

            // Is deletion
            const isDeletion = req.method === "DELETE";

            // Updating the user's photo
            user.photoPath = isDeletion ? null : `${usersPhotoConfig.urlPath}/${req.file?.filename}`;
            await user.save();

            if (isDeletion) res.sendStatus(204);
            else res.json({ photoURL: user.photoURL });
        }
        catch (error) {
            next(error);
        }
    }


    // Udpates a user's data
    static async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            // Finding the user
            const user = await UserModel.findOne({ _id: req.params.userId });
            if (!user) return next(new AppError(404, "The user does not exist"));
            // Updating the user
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.email = req.body.email;
            await user.save();

            res.json(user);
        }
        catch (error) {
            next(error);
        }
    }


    // Logs in a user
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            // Making sure that the email and the password field are not empty
            if (!req.body.email) return next(new AppError(400, 'Email must not be empty'));
            if (!req.body.password) return next(new AppError(400, 'Password must not be empty'));

            const errorMessage = "The email or password is wrong"

            // Finding users having the email
            const usersHavingEmail = await UserModel.find({ email: req.body.email }).select("-__v");

            // Searching if there's any password match
            let n = usersHavingEmail.length;
            if (n === 0) return next(new AppError(400, errorMessage));
            for (let i = 0; i < n; i++) {
                const userHavingEmail = usersHavingEmail[i];
                if (await bcrypt.compare(req.body.password, userHavingEmail.password)) {
                    // Token
                    const token = await jwtSign({ userId: userHavingEmail._id }, "user", 3600 * 24);

                    return res.json({ token, user: userHavingEmail });
                }
            }

            next(new AppError(400, errorMessage));
        }
        catch (error) {
            next(error);
        }
    }

}

export default UsersController;