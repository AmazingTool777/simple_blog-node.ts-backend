import { Model, FilterQuery } from "mongoose";

// Interface for the paginated results
interface PaginatedResults<ModelAttributes> {
    count: number;
    pages: number;
    rows: ModelAttributes[]
}

// Interface for the query options
interface QueryOptions<ModelAttributes> {
    filter: FilterQuery<ModelAttributes>;
    projection?: string,
    sort?: string
}

// The find query paginator
async function paginatedFind<ModelAttributes>(model: Model<ModelAttributes>, page: number, limit: number, options: QueryOptions<ModelAttributes>): Promise<PaginatedResults<ModelAttributes>> {
    const count = await model.countDocuments(options.filter);
    const pages = Math.ceil(count / limit);
    return {
        count,
        pages,
        rows: await model.find(options.filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .select(options.projection)
            .sort(options.sort)
    }
}

export default paginatedFind;