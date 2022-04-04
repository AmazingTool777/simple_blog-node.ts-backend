import { Request, Response, NextFunction } from "express";
import { FilterQuery } from "mongoose";

// Category model
import CategoryModel, { CategoryAttributes } from "../models/category-model";

// Paginated find
import paginatedFind from "../helpers/paginatedFind-helper";

// Class for the categories controller
class CategoriesController {

    // Gets categories *****************************************************************
    static async getCategories(req: Request, res: Response, next: NextFunction) {
        try {
            const filter: FilterQuery<CategoryAttributes> = {
                label: new RegExp(req.query.search ? decodeURI(req.query.search as string) : "", "i")
            }
            const projection = "-posts";
            if (req.query.page) {
                const page = parseInt(req.query.page as string);
                const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
                const paginatedCategories = await paginatedFind<CategoryAttributes>(CategoryModel, page, limit, { filter, projection });
                res.json(paginatedCategories);
            }
            else {
                const categories = await CategoryModel.find(filter).select(projection);
                res.json(categories);
            }
        }
        catch (error) {
            next(error);
        }
    }


}

export default CategoriesController;