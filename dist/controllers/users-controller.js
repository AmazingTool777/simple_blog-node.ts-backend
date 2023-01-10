"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
// App error class
const AppError_class_1 = __importDefault(require("../@types/AppError-class"));
// Models
const user_model_1 = __importDefault(require("../models/user-model"));
const post_model_1 = __importDefault(require("../models/post-model"));
const following_model_1 = __importDefault(require("../models/following-model"));
// Paginated find
const paginatedFind_helper_1 = __importDefault(require("../helpers/paginatedFind-helper"));
// JWT helper methods
const jwt_helper_1 = require("../helpers/jwt-helper");
// Api photo deleter
const deleteApiPhoto_helper_1 = __importDefault(require("../helpers/deleteApiPhoto-helper"));
// User photo config
const photos_config_1 = require("../configs/photos-config");
// Actions event emitter
const actionsEventEmitter_1 = __importDefault(require("../actionsEventEmitter"));
// Users controller class
class UsersController {
    // Gets users **********************************************************************
    static async getUsers(req, res, next) {
        try {
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);
            const search = req.query.search ? decodeURI(req.query.search) : "";
            const filter = {
                $or: [{ firstName: new RegExp(search, "i") }, { lastName: new RegExp(search, "i") }]
            };
            const projection = "-password";
            const sort = (!req.query.order || req.query.order === "asc" ? "" : "-") + "createdAt";
            const paginatedUsers = await (0, paginatedFind_helper_1.default)(user_model_1.default, page, limit, { filter, sort, projection });
            res.json(paginatedUsers);
        }
        catch (error) {
            next(error);
        }
    }
    // Gets a user *********************************************************************
    static async getUser(req, res, next) {
        try {
            const { authUser } = res.locals;
            const { userId } = req.params;
            const user = await user_model_1.default.findById(userId).select('-password');
            if (!user)
                return next(new AppError_class_1.default(404, "The user does not exist"));
            const followersCount = await following_model_1.default.count({ followedUser: userId });
            const followedsCount = await following_model_1.default.count({ follower: userId });
            const responseData = {
                ...user.toJSON(),
                followersCount,
                followedsCount
            };
            if (authUser) {
                const following = await following_model_1.default.findOne({ follower: authUser.userId });
                responseData.following = following;
            }
            res.json(responseData);
        }
        catch (error) {
            next(error);
        }
    }
    // Signs up a user *****************************************************************
    static async signupUser(req, res, next) {
        try {
            // Getting the hashed password
            const hashedPassword = await bcrypt_1.default.hash(req.body.password, 10);
            // Storing the user to db
            const newUserDocument = new user_model_1.default({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                gender: req.body.gender,
                email: req.body.email,
                password: hashedPassword,
            });
            const addedUser = await newUserDocument.save();
            // Signing the user with JWT
            const token = await (0, jwt_helper_1.jwtSign)({ userId: addedUser._id }, "user", 3600 * 24);
            res.send({ token, user: addedUser });
        }
        catch (error) {
            next(error);
        }
    }
    // Updates a user's photo
    static async updateUserPhoto(req, res, next) {
        try {
            const { authUser } = res.locals;
            // Searching if the user exists
            const user = await user_model_1.default.findById(req.params.userId);
            if (!user)
                return next(new AppError_class_1.default(404, "The user does not exist"));
            if (user._id.toString() !== authUser.userId)
                return next(new AppError_class_1.default(403, "You're not allowed to delete this user"));
            // Deleting user photo from files
            if (user.photoPath)
                (0, deleteApiPhoto_helper_1.default)(photos_config_1.usersPhotoConfig.storagePath, user.photoPath);
            // Is deletion
            const isDeletion = req.method === "DELETE";
            // Updating the user's photo
            user.photoPath = isDeletion ? null : `${photos_config_1.usersPhotoConfig.urlPath}/${req.file?.filename}`;
            await user.save();
            if (isDeletion)
                res.sendStatus(204);
            else
                res.json({ photoURL: user.photoURL });
        }
        catch (error) {
            next(error);
        }
    }
    // Udpates a user's data
    static async updateUser(req, res, next) {
        try {
            const { authUser } = res.locals;
            // Finding the user
            const user = await user_model_1.default.findOne({ _id: req.params.userId });
            if (!user)
                return next(new AppError_class_1.default(404, "The user does not exist"));
            if (user._id.toString() !== authUser.userId)
                return next(new AppError_class_1.default(403, "You're not allowed to delete this user"));
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
    static async updateUserPassword(req, res, next) {
        try {
            const { authUser } = res.locals;
            const user = await user_model_1.default.findById(req.params?.userId);
            if (!user)
                return next(new AppError_class_1.default(404, "The user does not exist"));
            if (user._id.toString() !== authUser.userId)
                return next(new AppError_class_1.default(403, "You're not allowed to delete this user"));
            const hashedPassword = await bcrypt_1.default.hash(req.body.password, 10);
            user.password = hashedPassword;
            await user.save();
            res.json({ message: "User's password updated successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    // Logs in a user
    static async login(req, res, next) {
        try {
            // Making sure that the email and the password field are not empty
            if (!req.body.email)
                return next(new AppError_class_1.default(400, 'Email must not be empty'));
            if (!req.body.password)
                return next(new AppError_class_1.default(400, 'Password must not be empty'));
            const errorMessage = "The email or password is wrong";
            // Finding users having the email
            const usersHavingEmail = await user_model_1.default.find({ email: req.body.email }).select("-__v");
            // Searching if there's any password match
            let n = usersHavingEmail.length;
            if (n === 0)
                return next(new AppError_class_1.default(400, errorMessage));
            for (let i = 0; i < n; i++) {
                const userHavingEmail = usersHavingEmail[i];
                if (await bcrypt_1.default.compare(req.body.password, userHavingEmail.password)) {
                    // Token
                    const token = await (0, jwt_helper_1.jwtSign)({ userId: userHavingEmail._id }, "user", 3600 * 24);
                    return res.json({ token, user: userHavingEmail });
                }
            }
            next(new AppError_class_1.default(400, errorMessage));
        }
        catch (error) {
            next(error);
        }
    }
    // Gets a user from token
    static async getUserFromToken(req, res, next) {
        try {
            const { authUser } = res.locals;
            const user = await user_model_1.default.findOne({ _id: authUser.userId }).select('-password');
            if (!user)
                return next(new AppError_class_1.default(404, "The user does not exist"));
            // Token
            const token = await (0, jwt_helper_1.jwtSign)({ userId: user._id }, "user", 3600 * 24);
            res.json({ user, token });
        }
        catch (error) {
            next(error);
        }
    }
    // Deletes a user
    static async deleteUser(req, res, next) {
        try {
            const { authUser } = res.locals;
            const user = await user_model_1.default.findById(req.params?.userId);
            if (!user)
                return next(new AppError_class_1.default(404, "The user does not exist"));
            if (user._id.toString() != authUser.userId)
                return next(new AppError_class_1.default(403, "You're not allowed to delete this user"));
            if (!(await bcrypt_1.default.compare(req.body.password, user.password)))
                return next(new AppError_class_1.default(400, "Invalid password"));
            const userPosts = await post_model_1.default.find({ author: user._id });
            await Promise.allSettled(userPosts.map(post => {
                (0, deleteApiPhoto_helper_1.default)(photos_config_1.postsPhotoConfig.storagePath, post.photoPath);
                return post_model_1.default.deleteOne({ _id: post._id });
            }));
            const photoPath = user.photoPath;
            await user.delete();
            if (photoPath)
                (0, deleteApiPhoto_helper_1.default)(photos_config_1.usersPhotoConfig.storagePath, photoPath);
            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    }
    // Gets a user's followings, be it followers or followings
    static async getFollowings(req, res, next) {
        try {
            const { userId } = req.params;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const entity = req.query.entity ? req.query.entity : "followers";
            const ENTITIES = ['followers', 'followeds'];
            if (!ENTITIES.includes(entity))
                return next(new AppError_class_1.default(400, "The entity must be either 'followers' or 'followeds'"));
            const sort = (!req.query.order || req.query.order === "asc" ? "" : "-") + "createdAt";
            /*
            The populated field and the queried field are swapped
            */
            const populatedField = entity === "followers" ? "follower" : "followedUser";
            const queriedField = entity === "followers" ? "followedUser" : "follower";
            const paginatedFollowings = await (0, paginatedFind_helper_1.default)(following_model_1.default, page, limit, {
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
    static async addFollowing(req, res, next) {
        try {
            const { authUser } = res.locals;
            const { userId } = req.params;
            const follower = await user_model_1.default.findById(authUser.userId);
            const followedUser = await user_model_1.default.findById(userId);
            if (!follower)
                return next(new AppError_class_1.default(404, "The user to authenticate does not exist"));
            if (!followedUser)
                return next(new AppError_class_1.default(404, "The followed user does not exist"));
            if (followedUser._id.equals(follower._id))
                return next(new AppError_class_1.default(403, "A user cannot follow himself/herself"));
            const following = await following_model_1.default.create({
                followedUser: followedUser._id,
                follower: follower._id
            });
            actionsEventEmitter_1.default.emit("following_added", follower, following);
            res.status(201).json(following);
        }
        catch (error) {
            next(error);
        }
    }
    // Removes a following
    static async removeFollowing(req, res, next) {
        try {
            const { authUser } = res.locals;
            const { userId, followingId } = req.params;
            const following = await following_model_1.default.findById(followingId);
            if (!following)
                return next(new AppError_class_1.default(404, "The following does not exist"));
            if (!following.follower.equals(authUser.userId) || !following.followedUser.equals(userId))
                return next(new AppError_class_1.default(403, "You're not allowed to remove this following"));
            await following.remove();
            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = UsersController;
