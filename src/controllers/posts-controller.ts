import { Request, Response, NextFunction } from "express";
import mongoose, { FilterQuery, Types, ObjectId } from "mongoose";

// App error class
import AppError from "../@types/AppError-class";

// Helpers
import paginatedFind from "../helpers/paginatedFind-helper";
import deleteApiPhoto from "../helpers/deleteApiPhoto-helper";

// Models
import PostModel, { PostAttributes } from "../models/post-model";
import CategoryModel from "../models/category-model";
import LikeModel from "../models/like-model";

// Posts photos config
import { postsPhotoConfig } from "../configs/photos-config";

// Class for posts controller
class PostsController {

    // Gets posts under pagination *****************************************************
    static async getPaginatedPosts(req: Request, res: Response, next: NextFunction) {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
            const search = req.query.search ? decodeURI(req.query.search as string) : "";
            const filter: FilterQuery<PostAttributes> = {
                title: new RegExp(search, "i")
            }
            if (req.query.categoryId) filter.categories = req.query.categoryId as string;
            if (req.query.authorId) filter.author = req.query.authorId as string;
            const projection = "-categories -content -likes";
            const populate = { field: "author", projection: "_id firstName lastName gender photoPath" };
            const sort = (!req.query.order || (req.query.order as string) === "asc" ? "" : "-") + "createdAt";
            const paginatedPosts = await paginatedFind<PostAttributes>(PostModel, page, limit, { filter, projection, sort, populate });
            res.json(paginatedPosts);
        }
        catch (error) {
            next(error);
        }
    }


    // Gets a post *********************************************************************
    static async getPost(req: Request, res: Response, next: NextFunction) {
        try {
            const { authUser } = res.locals;

            const post = await PostModel.findById(req.params.postId, "-likes")
                .populate("author", "_id firstName lastName gender photoPath")
                .populate("categories", "-posts");

            if (!post) return next(new AppError(404, "The post is not found"));

            const likesCount = await LikeModel.count({ post: post._id });

            let like;
            if (authUser) like = await LikeModel.findOne({ author: authUser._id });

            const responseData: any = {
                ...post.toJSON(),
                likesCount,
            }
            if (authUser) responseData.like = like;

            res.json(responseData);
        }
        catch (error) {
            next(error);
        }
    }


    // Adds a post *********************************************************************
    static async addPost(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.authUser;
            const photoFilename = req.file?.filename;

            // Creating the new post document
            const post = new PostModel({
                title: req.body.title,
                content: req.body.content,
                photoPath: `${postsPhotoConfig.urlPath}/${photoFilename}`,
                author: userId
            });
            // Re-formatting the categories
            if (!req.body.categories) req.body.categories = [];
            if (!req.body.newCategories) req.body.newCategories = [];

            // Checks if there are new categories that already exist
            const checkExistingNewCategories = await Promise.allSettled((req.body.newCategories as string[]).map(label => {
                return CategoryModel.findOne({ label: new RegExp(label, "i") });
            }));
            // Distinguishing the already existing categories and the non-existing ones
            const existingCategories: Types.ObjectId[] = [];
            const nonExistingCategories: string[] = [];
            checkExistingNewCategories.forEach((result, i) => {
                if (result.status === "fulfilled") {
                    if (result.value) existingCategories.push(result.value._id);
                    else nonExistingCategories.push(req.body.newCategories[i]);
                }
                else nonExistingCategories.push(req.body.newCategories[i]);
            });
            // Storing the non-existing categories
            const addedCategories = await CategoryModel.insertMany(nonExistingCategories.map(label => ({ label, posts: [post._id] })));

            // Setting the final categories for the post
            post.categories = [... new Set<Types.ObjectId>([...(req.body.categories as Types.ObjectId[]), ...existingCategories]), ...addedCategories.map(({ _id }) => _id)];

            // Saving the post to db
            await post.save();

            res.send(post);
        }
        catch (error) {
            next(error);
        }
    }


    // Updates a post's title and content **********************************************
    static async updatePostTitleAndContent(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.authUser;
            const { postId } = req.params;

            const post = await PostModel.findById(postId);
            if (!post) return next(new AppError(404, "The post does not exist"));

            if (post.author.toString() !== userId)
                return next(new AppError(403, "You are not allowed to edit this post"));

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
    static async updatePostCategories(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.authUser;
            const { postId } = req.params;

            const post = await PostModel.findById(postId);
            if (!post) return next(new AppError(404, "The post does not exist"));

            if (post.author.toString() !== userId)
                return next(new AppError(403, "You are not allowed to edit this post"));

            // Removing the post's id in each of the post's category document
            const categoriesNb = post.categories.length;
            for (let i = 0; i < categoriesNb; i++) {
                const category = await CategoryModel.findById(post.categories[i]);
                if (category) {
                    category.posts = category.posts.filter(postId => postId.toString() !== post._id.toString());
                    await category.save();
                }
            }

            // Checks if there are new categories that already exist
            const checkExistingNewCategories = await Promise.allSettled((req.body.newCategories as string[]).map(label => {
                return CategoryModel.findOne({ label: new RegExp(label, "i") });
            }));
            // Distinguishing the already existing categories and the non-existing ones
            const existingCategories: Types.ObjectId[] = [];
            const nonExistingCategories: string[] = [];
            checkExistingNewCategories.forEach((result, i) => {
                if (result.status === "fulfilled") {
                    if (result.value) existingCategories.push(result.value._id);
                    else nonExistingCategories.push(req.body.newCategories[i]);
                }
                else nonExistingCategories.push(req.body.newCategories[i]);
            });
            // Storing the non-existing categories
            const addedCategories = await CategoryModel.insertMany(nonExistingCategories.map(label => ({ label, posts: [post._id] })));

            // Setting the final categories for the post
            post.categories = [... new Set<Types.ObjectId>([...(req.body.categories as Types.ObjectId[]), ...existingCategories]), ...addedCategories.map(({ _id }) => _id)];

            // Saving the post to db
            await post.save();

            res.send(post);
        }
        catch (error) {
            next(error);
        }
    }


    // Deletes a post
    static async deletePost(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.authUser;
            const { postId } = req.params;

            const post = await PostModel.findById(postId);
            if (!post) return next(new AppError(404, "The post does not exist"));

            if (post.author.toString() !== userId)
                return next(new AppError(403, "You are not allowed to delete this post"));

            // Removing the post's id in each of the post's category document
            const categoriesNb = post.categories.length;
            for (let i = 0; i < categoriesNb; i++) {
                const category = await CategoryModel.findById(post.categories[i]);
                if (category) {
                    category.posts = category.posts.filter(postId => postId.toString() !== post._id.toString());
                    await category.save();
                }
            }

            const photoPath = post.photoPath;

            await post.delete();

            deleteApiPhoto(postsPhotoConfig.storagePath, photoPath);

            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    }


    // Add a like to a post from a user
    static async addLikeToPost(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.authUser;
            const { postId } = req.params;

            const post = await PostModel.findOne({ _id: postId });
            if (!post) return next(new AppError(404, "The post does not exist"));

            const existingLike = await LikeModel.findOne({ user: userId });
            if (existingLike) return next(new AppError(400, 'The post is already liked by the user'));

            const like = await LikeModel.create({
                post: postId,
                user: userId
            });

            res.json(like);
        } catch (error) {
            next(error);
        }
    }


    // Removes a like from a post
    static async removeLikeFromPost(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = res.locals.authUser;
            const { postId, likeId } = req.params;

            const like = await LikeModel.findOne({ _id: likeId });
            if (!like) return next(new AppError(404, "The like does not exist"));

            if (!like.post.equals(postId) || !like.user.equals(userId))
                return next(new AppError(403, "You are not allowed to remove this post"));

            await like.remove();

            return res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }

}

export default PostsController;