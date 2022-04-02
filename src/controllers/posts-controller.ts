import { Request, Response, NextFunction } from "express";
import { FilterQuery } from "mongoose";

// App error class
import AppError from "../@types/AppError-class";

// Paginated find
import paginatedFind from "../helpers/paginatedFind-helper";

// Post model
import PostModel, { PostAttributes } from "../models/post-model";

// Class for posts controller
class PostsController {

    // Gets posts under pagination *****************************************************
    static async getPaginatedPosts(req: Request, res: Response, next: NextFunction) {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
            const filter: FilterQuery<PostAttributes> = {
                title: new RegExp(decodeURI(req.query.search as string), "i")
            }
            const projection = "-categories";
            const paginatedPosts = await paginatedFind<PostAttributes>(PostModel, page, limit, { filter, projection });
            res.json(paginatedPosts);
        }
        catch (error) {
            next(error);
        }
    }


    // Gets a post *********************************************************************
    static async getPost(req: Request, res: Response, next: NextFunction) {
        try {
            const post = await PostModel.findById(req.params.postId).populate("author", "_id firstName lastName gender photoPath").populate("categories");
            if (!post) return next(new AppError(404, "The post is not found"));
            res.json(post);
        }
        catch (error) {
            next(error);
        }
    }

}

export default PostsController;