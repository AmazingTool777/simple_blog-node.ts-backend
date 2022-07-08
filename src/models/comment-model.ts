import mongoose, { Schema, Types } from "mongoose";

// Interface for a comment model's attributes
interface CommentAttributes {
    content: string,
    post: Types.ObjectId,
    user: Types.ObjectId,
}

// Schema for a comment model
const commentModelSchema = new Schema<CommentAttributes>(
    {
        content: {
            type: Schema.Types.String,
            required: true
        },
        post: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Post'
        },
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        timestamps: true
    }
);

// Comment model
const CommentModel = mongoose.model('Comment', commentModelSchema);

export default CommentModel;
export { CommentAttributes };