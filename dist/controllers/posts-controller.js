"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// App error class
const AppError_class_1 = __importDefault(require("../@types/AppError-class"));
// Helpers
const paginatedFind_helper_1 = __importDefault(require("../helpers/paginatedFind-helper"));
const deleteApiPhoto_helper_1 = __importDefault(require("../helpers/deleteApiPhoto-helper"));
// Models
const user_model_1 = __importDefault(require("../models/user-model"));
const post_model_1 = __importDefault(require("../models/post-model"));
const category_model_1 = __importDefault(require("../models/category-model"));
const like_model_1 = __importDefault(require("../models/like-model"));
const comment_model_1 = __importDefault(require("../models/comment-model"));
// Posts photos config
const photos_config_1 = require("../configs/photos-config");
// Actions event emitter
const actionsEventEmitter_1 = __importDefault(require("../actionsEventEmitter"));
// Class for posts controller
class PostsController {
    // Gets posts under pagination *****************************************************
    static async getPaginatedPosts(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const search = req.query.search ? decodeURI(req.query.search) : "";
            const filter = {
                title: new RegExp(search, "i")
            };
            if (req.query.categoryId)
                filter.categories = req.query.categoryId;
            if (req.query.authorId)
                filter.author = req.query.authorId;
            const projection = "-categories -content -likes";
            const populate = { field: "author", projection: "_id firstName lastName gender photoPath" };
            const sort = (!req.query.order || req.query.order === "asc" ? "" : "-") + "createdAt";
            const paginatedPosts = await (0, paginatedFind_helper_1.default)(post_model_1.default, page, limit, { filter, projection, sort, populate });
            res.json(paginatedPosts);
        }
        catch (error) {
            next(error);
        }
    }
    // Gets a post *********************************************************************
    static async getPost(req, res, next) {
        try {
            const { authUser } = res.locals;
            const post = await post_model_1.default.findById(req.params.postId, "-likes")
                .populate("author", "_id firstName lastName gender photoPath")
                .populate("categories", "-posts");
            if (!post)
                return next(new AppError_class_1.default(404, "The post is not found"));
            const likesCount = await like_model_1.default.count({ post: post._id });
            const commentsCount = await comment_model_1.default.count({ post: post._id });
            let like;
            if (authUser)
                like = await like_model_1.default.findOne({ post: post._id, user: authUser.userId });
            const responseData = {
                ...post.toJSON(),
                likesCount,
                commentsCount
            };
            if (authUser)
                responseData.like = like;
            res.json(responseData);
        }
        catch (error) {
            next(error);
        }
    }
    // Adds a post *********************************************************************
    static async addPost(req, res, next) {
        try {
            const { userId } = res.locals.authUser;
            const photoFilename = req.file?.filename;
            const user = await user_model_1.default.findById(userId);
            if (!user)
                return next(new AppError_class_1.default(404, "The user to authenticate does not exist"));
            // Creating the new post document
            const post = new post_model_1.default({
                title: req.body.title,
                content: req.body.content,
                photoPath: `${photos_config_1.postsPhotoConfig.urlPath}/${photoFilename}`,
                author: user._id
            });
            // Re-formatting the categories
            if (!req.body.categories)
                req.body.categories = [];
            if (!req.body.newCategories)
                req.body.newCategories = [];
            // Checks if there are new categories that already exist
            const checkExistingNewCategories = await Promise.allSettled(req.body.newCategories.map(label => {
                return category_model_1.default.findOne({ label: new RegExp(label, "i") });
            }));
            // Distinguishing the already existing categories and the non-existing ones
            const existingCategories = [];
            const nonExistingCategories = [];
            checkExistingNewCategories.forEach((result, i) => {
                if (result.status === "fulfilled") {
                    if (result.value)
                        existingCategories.push(result.value._id);
                    else
                        nonExistingCategories.push(req.body.newCategories[i]);
                }
                else
                    nonExistingCategories.push(req.body.newCategories[i]);
            });
            // Storing the non-existing categories
            const addedCategories = await category_model_1.default.insertMany(nonExistingCategories.map(label => ({ label, posts: [post._id] })));
            // Setting the final categories for the post
            post.categories = [...new Set([...req.body.categories, ...existingCategories]), ...addedCategories.map(({ _id }) => _id)];
            // Saving the post to db
            await post.save();
            // Fetching author's followers
            user_model_1.default.aggregate([
                {
                    $lookup: {
                        from: "followings",
                        localField: "_id",
                        foreignField: "follower",
                        pipeline: [
                            {
                                $match: {
                                    followedUser: user._id
                                }
                            }
                        ],
                        as: "following"
                    }
                },
                {
                    $unwind: {
                        path: "$following",
                        preserveNullAndEmptyArrays: false
                    }
                }
            ]).then(followers => {
                // Emitting a new post event to followers
                actionsEventEmitter_1.default.emit("post_added", post, user, followers);
            });
            res.send(post);
        }
        catch (error) {
            next(error);
        }
    }
    // Updates a post's title and content **********************************************
    static async updatePostTitleAndContent(req, res, next) {
        try {
            const { userId } = res.locals.authUser;
            const { postId } = req.params;
            const post = await post_model_1.default.findById(postId);
            if (!post)
                return next(new AppError_class_1.default(404, "The post does not exist"));
            if (post.author.toString() !== userId)
                return next(new AppError_class_1.default(403, "You are not allowed to edit this post"));
            post.title = req.body.title;
            post.content = req.body.content;
            await post.save();
            res.send(post);
        }
        catch (error) {
            next(error);
        }
    }
    // Updates a post's categories *****************************************************
    static async updatePostCategories(req, res, next) {
        try {
            const { userId } = res.locals.authUser;
            const { postId } = req.params;
            const post = await post_model_1.default.findById(postId);
            if (!post)
                return next(new AppError_class_1.default(404, "The post does not exist"));
            if (post.author.toString() !== userId)
                return next(new AppError_class_1.default(403, "You are not allowed to edit this post"));
            // Removing the post's id in each of the post's category document
            const categoriesNb = post.categories.length;
            for (let i = 0; i < categoriesNb; i++) {
                const category = await category_model_1.default.findById(post.categories[i]);
                if (category) {
                    category.posts = category.posts.filter(postId => postId.toString() !== post._id.toString());
                    await category.save();
                }
            }
            // Checks if there are new categories that already exist
            const checkExistingNewCategories = await Promise.allSettled(req.body.newCategories.map(label => {
                return category_model_1.default.findOne({ label: new RegExp(label, "i") });
            }));
            // Distinguishing the already existing categories and the non-existing ones
            const existingCategories = [];
            const nonExistingCategories = [];
            checkExistingNewCategories.forEach((result, i) => {
                if (result.status === "fulfilled") {
                    if (result.value)
                        existingCategories.push(result.value._id);
                    else
                        nonExistingCategories.push(req.body.newCategories[i]);
                }
                else
                    nonExistingCategories.push(req.body.newCategories[i]);
            });
            // Storing the non-existing categories
            const addedCategories = await category_model_1.default.insertMany(nonExistingCategories.map(label => ({ label, posts: [post._id] })));
            // Setting the final categories for the post
            post.categories = [...new Set([...req.body.categories, ...existingCategories]), ...addedCategories.map(({ _id }) => _id)];
            // Saving the post to db
            await post.save();
            res.send(post);
        }
        catch (error) {
            next(error);
        }
    }
    // Deletes a post
    static async deletePost(req, res, next) {
        try {
            const { userId } = res.locals.authUser;
            const { postId } = req.params;
            const post = await post_model_1.default.findById(postId);
            if (!post)
                return next(new AppError_class_1.default(404, "The post does not exist"));
            if (post.author.toString() !== userId)
                return next(new AppError_class_1.default(403, "You are not allowed to delete this post"));
            // Removing the post's id in each of the post's category document
            const categoriesNb = post.categories.length;
            for (let i = 0; i < categoriesNb; i++) {
                const category = await category_model_1.default.findById(post.categories[i]);
                if (category) {
                    category.posts = category.posts.filter(postId => postId.toString() !== post._id.toString());
                    await category.save();
                }
            }
            const photoPath = post.photoPath;
            await post.delete();
            (0, deleteApiPhoto_helper_1.default)(photos_config_1.postsPhotoConfig.storagePath, photoPath);
            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    }
    // Gets a post's paginated likes
    static async getPostPaginatedLikes(req, res, next) {
        try {
            const { postId } = req.params;
            const post = await post_model_1.default.findById(postId);
            if (!post)
                return next(new AppError_class_1.default(404, "The post does not exist"));
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const sort = (!req.query.order || req.query.order === "asc" ? "" : "-") + "createdAt";
            const paginatedLikes = await (0, paginatedFind_helper_1.default)(like_model_1.default, page, limit, {
                filter: { post: post._id },
                sort,
                populate: {
                    field: "user",
                    projection: "_id firstName lastName gender photoPath"
                }
            });
            res.json(paginatedLikes);
        }
        catch (error) {
            next(error);
        }
    }
    // Add a like to a post from a user
    static async addLikeToPost(req, res, next) {
        try {
            const { userId } = res.locals.authUser;
            const { postId } = req.params;
            const user = await user_model_1.default.findById(userId);
            if (!user)
                return next(new AppError_class_1.default(404, "The user to authenticate does not exist"));
            const post = await post_model_1.default.findOne({ _id: postId });
            if (!post)
                return next(new AppError_class_1.default(404, "The post does not exist"));
            const existingLike = await like_model_1.default.findOne({ post: post._id, user: user._id });
            if (existingLike)
                return next(new AppError_class_1.default(400, 'The post is already liked by the user'));
            const like = await like_model_1.default.create({
                post: postId,
                user: user._id
            });
            actionsEventEmitter_1.default.emit("like_added", post, like, user);
            res.json(like);
        }
        catch (error) {
            next(error);
        }
    }
    // Removes a like from a post
    static async removeLikeFromPost(req, res, next) {
        try {
            const { userId } = res.locals.authUser;
            const { postId, likeId } = req.params;
            const like = await like_model_1.default.findOne({ _id: likeId });
            if (!like)
                return next(new AppError_class_1.default(404, "The like does not exist"));
            if (!like.post.equals(postId) || !like.user.equals(userId))
                return next(new AppError_class_1.default(403, "You are not allowed to remove this post"));
            await like.remove();
            return res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    }
    // Gets a post's paginated comments
    static async getPostPaginatedComments(req, res, next) {
        try {
            const { postId } = req.params;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const sort = (!req.query.order || req.query.order === "asc" ? "" : "-") + "createdAt";
            const populate = { field: "user", projection: "_id firstName lastName gender photoPath" };
            const options = { filter: { post: postId }, sort, populate };
            const paginatedComments = await (0, paginatedFind_helper_1.default)(comment_model_1.default, page, limit, options);
            res.json(paginatedComments);
        }
        catch (error) {
            next(error);
        }
    }
    // Adds a comment to a post
    static async addCommentToPost(req, res, next) {
        try {
            const { authUser } = res.locals;
            const { postId } = req.params;
            const user = await user_model_1.default.findById(authUser.userId);
            if (!user)
                return next(new AppError_class_1.default(404, "The user to authenticate does not exist"));
            const post = await post_model_1.default.findOne({ _id: postId });
            if (!post)
                return next(new AppError_class_1.default(404, "The post does not exist"));
            const comment = await comment_model_1.default.create({
                content: req.body.content,
                post: postId,
                user: user._id
            });
            // Emitting the event that a comment has been added
            actionsEventEmitter_1.default.emit("comment_added", comment, post, user);
            return res.status(201).json(comment);
        }
        catch (error) {
            next(error);
        }
    }
    // Updates a comment's content
    static async updateCommentContent(req, res, next) {
        try {
            const { authUser } = res.locals;
            const { postId, commentId } = req.params;
            const user = await user_model_1.default.findById(authUser.userId);
            if (!user)
                return next(new AppError_class_1.default(404, "The user to authenticate does not exist"));
            const comment = await comment_model_1.default.findById(commentId);
            if (!comment)
                return next(new AppError_class_1.default(404, "The comment does not exist"));
            if (!comment.post.equals(postId) || !comment.user.equals(user._id))
                return next(new AppError_class_1.default(403, "You are not allowed to update this comment"));
            comment.content = req.body.content;
            await comment.save();
            const post = await post_model_1.default.findById({ _id: comment.post });
            // Emitting a post updated event
            actionsEventEmitter_1.default.emit("comment_updated", comment, post, user);
            res.json(comment);
        }
        catch (error) {
            next(error);
        }
    }
    // Deletes a comment
    static async deleteComment(req, res, next) {
        try {
            const { authUser } = res.locals;
            const { postId, commentId } = req.params;
            const comment = await comment_model_1.default.findById(commentId);
            if (!comment)
                return next(new AppError_class_1.default(404, "The comment does not exist"));
            if (!comment.post.equals(postId) || !comment.user.equals(authUser.userId))
                return next(new AppError_class_1.default(403, "You are not allowed to delete this comment"));
            await comment.remove();
            actionsEventEmitter_1.default.emit("comment_deleted", comment._id, postId);
            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = PostsController;
