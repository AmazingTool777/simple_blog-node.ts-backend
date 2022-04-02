import mongoose, { Schema, Types } from "mongoose";

// Network config
import networkConfig from "../configs/network-config";

// Interface for a post model's attributes
interface PostAttributes {
    title: string,
    content: string,
    photoPath: string,
    photoURL: string,
    categories: Types.ObjectId[],
    author: Types.ObjectId
}

// Schema for a post model
const postModelSchema = new Schema<PostAttributes>(
    {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        photoPath: {
            type: String,
            required: true
        },
        categories: [{
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Category"
        }],
        author: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User"
        }
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

// Virtual full photo URL
postModelSchema.virtual('photoURL').get(function (this: PostAttributes) {
    return this.photoPath ? `${networkConfig.url}${this.photoPath}` : null;
});

// Post model
const PostModel = mongoose.model('Post', postModelSchema);

export default PostModel;
export { PostAttributes };