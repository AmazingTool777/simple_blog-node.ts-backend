import mongoose, { Schema, Types } from "mongoose";

// Interface for a category model's attributes
interface CategoryAttributes {
    label: string,
    posts: Types.ObjectId[]
}

// Schema for a category model
const categoryModelSchema = new Schema<CategoryAttributes>({
    label: {
        type: String,
        required: true,
        unique: true
    },
    posts: [Schema.Types.ObjectId]
});

// Category model
const CategoryModel = mongoose.model('Category', categoryModelSchema);

export default CategoryModel;
export { CategoryAttributes };

