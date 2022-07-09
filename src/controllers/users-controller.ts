import { Request, Response, NextFunction } from "express";
import { FilterQuery } from "mongoose";
import bcrypt from "bcrypt";

// App error class
import AppError from "../@types/AppError-class";

// Models
import UserModel, { UserAttributes } from "../models/user-model";
import PostModel from "../models/post-model";
import FollowingModel, { FollowingAttributes } from "../models/following-model";

// Paginated find
import paginatedFind from "../helpers/paginatedFind-helper";

// JWT helper methods
import { jwtSign } from "../helpers/jwt-helper";

// Api photo deleter
import deleteApiPhoto from "../helpers/deleteApiPhoto-helper";

// User photo config
import { usersPhotoConfig, postsPhotoConfig } from "../configs/photos-config";

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
            const projection = "-password";
            const sort = (!req.query.order || (req.query.order as string) === "asc" ? "" : "-") + "createdAt";
            const paginatedUsers = await paginatedFind<UserAttributes>(UserModel, page, limit, { filter, sort, projection });
            res.json(paginatedUsers);
        }
        catch (error) {
            next(error);
        }
    }


    // Gets a user *********************************************************************
    static async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await UserModel.findOne({ _id: req.params.userId }).select('-password');
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
            const token = await jwtSign({ userId: addedUser._id }, "user", 3600 * 24);

            res.send({ token, user: addedUser });
        }
        catch (error) {
            next(error);
        }
    }


    // Updates a user's photo
    static async updateUserPhoto(req: Request, res: Response, next: NextFunction) {
        try {
            const { authUser } = res.locals;

            // Searching if the user exists
            const user = await UserModel.findById(req.params.userId);
            if (!user) return next(new AppError(404, "The user does not exist"));
            if (user._id.toString() !== authUser.userId)
                return next(new AppError(403, "You're not allowed to delete this user"));

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
            const { authUser } = res.locals;
            // Finding the user
            const user = await UserModel.findOne({ _id: req.params.userId });
            if (!user) return next(new AppError(404, "The user does not exist"));
            if (user._id.toString() !== authUser.userId)
                return next(new AppError(403, "You're not allowed to delete this user"));
            // Updating the user
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.email = req.body.email;
            user.gender = req.body.gender;
            await user.save();

            res.json(user);
        }
        catch (error) {
            next(error);
        }
    }


    // Updates a user's password
    static async updateUserPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { authUser } = res.locals;
            const user = await UserModel.findById(req.params?.userId);
            if (!user) return next(new AppError(404, "The user does not exist"));
            if (user._id.toString() !== authUser.userId)
                return next(new AppError(403, "You're not allowed to delete this user"));
            const hashedPassword = await bcrypt.hash(req.body.password as string, 10);
            user.password = hashedPassword;
            await user.save();
            res.json({ message: "User's password updated successfully" });
        } catch (error) {
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


    // Gets a user from token
    static async getUserFromToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { authUser } = res.locals;

            const user = await UserModel.findOne({ _id: authUser.userId }).select('-password');
            if (!user) return next(new AppError(404, "The user does not exist"));

            // Token
            const token = await jwtSign({ userId: user._id }, "user", 3600 * 24);

            res.json({ user, token });
        }
        catch (error) {
            next(error);
        }
    }


    // Deletes a user
    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { authUser } = res.locals;

            const user = await UserModel.findById(req.params?.userId);

            if (!user) return next(new AppError(404, "The user does not exist"));
            if (user._id.toString() != authUser.userId)
                return next(new AppError(403, "You're not allowed to delete this user"));

            if (!(await bcrypt.compare(req.body.password, user.password)))
                return next(new AppError(400, "Invalid password"));

            const userPosts = await PostModel.find({ author: user._id });
            await Promise.allSettled(userPosts.map(post => {
                deleteApiPhoto(postsPhotoConfig.storagePath, post.photoPath);
                return PostModel.deleteOne({ _id: post._id });
            }))

            const photoPath = user.photoPath;
            await user.delete();
            if (photoPath) deleteApiPhoto(usersPhotoConfig.storagePath, photoPath);

            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }


    // Gets a user's followings, be it followers or followings
    static async getFollowings(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;

            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

            const entity = req.query.entity ? (req.query.entity as string) : "followers";
            const ENTITIES = ['followers', 'followeds'];
            if (!ENTITIES.includes(entity))
                return next(new AppError(400, "The entity must be either 'followers' or 'followeds'"));

            const sort = (!req.query.order || (req.query.order as string) === "asc" ? "" : "-") + "createdAt";

            /* 
            The populated field and the queried field are swapped
            */
            const populatedField = entity === "followers" ? "follower" : "followedUser";
            const queriedField = entity === "followers" ? "followedUser" : "follower";

            const paginatedFollowings = await paginatedFind<FollowingAttributes>(FollowingModel, page, limit, {
                filter: { [queriedField]: userId },
                sort,
                populate: {
                    field: populatedField,
                    projection: "_id firstName lastName gender photoPath"
                }
            });

            res.json(paginatedFollowings);
        }
        catch (error) {
            next(error);
        }
    }


    // Adds a following
    static async addFollowing(req: Request, res: Response, next: NextFunction) {
        try {
            const { authUser } = res.locals;
            const { userId } = req.params;

            const followedUser = await UserModel.findById(userId);
            if (!followedUser) return next(new AppError(404, "The followed user does not exist"));
            if (followedUser._id.equals(authUser.userId))
                return next(new AppError(403, "A user cannot follow himself/herself"));

            const following = await FollowingModel.create({
                followedUser: followedUser._id,
                follower: authUser.userId
            });

            res.status(201).json(following);
        }
        catch (error) {
            next(error);
        }
    }


    // Removes a following
    static async removeFollowing(req: Request, res: Response, next: NextFunction) {
        try {
            const { authUser } = res.locals;
            const { userId, followingId } = req.params;

            const following = await FollowingModel.findById(followingId);
            if (!following) return next(new AppError(404, "The following does not exist"));
            if (!following.follower.equals(authUser.userId) || !following.followedUser.equals(userId))
                return next(new AppError(403, "You're not allowed to remove this following"));

            await following.remove();

            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    }

}

export default UsersController;