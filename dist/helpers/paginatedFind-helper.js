"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The find query paginator
async function paginatedFind(model, page, limit, options) {
    const count = await model.countDocuments(options.filter);
    const pages = Math.ceil(count / limit);
    const query = model.find(options.filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .select(options.projection)
        .sort(options.sort);
    if (options.populate)
        query.populate(options.populate.field, options.populate.projection);
    return {
        count,
        pages,
        rows: await query
    };
}
exports.default = paginatedFind;
