"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Category model
const category_model_1 = __importDefault(require("../models/category-model"));
// Paginated find
const paginatedFind_helper_1 = __importDefault(require("../helpers/paginatedFind-helper"));
// Class for the categories controller
class CategoriesController {
    // Gets categories *****************************************************************
    static async getCategories(req, res, next) {
        try {
            const filter = {
                label: new RegExp(req.query.search ? decodeURI(req.query.search) : "", "i")
            };
            const projection = "-posts";
            if (req.query.page) {
                const page = parseInt(req.query.page);
                const limit = req.query.limit ? parseInt(req.query.limit) : 20;
                const paginatedCategories = await (0, paginatedFind_helper_1.default)(category_model_1.default, page, limit, { filter, projection });
                res.json(paginatedCategories);
            }
            else {
                const categories = await category_model_1.default.find(filter).select(projection);
                res.json(categories);
            }
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = CategoriesController;
