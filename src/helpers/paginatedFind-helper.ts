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
    sort?: string,
    populate?: { field: string, projection?: string }
}

// The find query paginator
async function paginatedFind<ModelAttributes>(model: Model<ModelAttributes>, page: number, limit: number, options: QueryOptions<ModelAttributes>): Promise<PaginatedResults<ModelAttributes>> {
    const count = await model.countDocuments(options.filter);
    const pages = Math.ceil(count / limit);
    const query = model.find(options.filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .select(options.projection)
        .sort(options.sort);
    if (options.populate) query.populate(options.populate.field, options.populate.projection);
    return {
        count,
        pages,
        rows: await query
    }
}

export default paginatedFind;