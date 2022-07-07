import mongoose, { Schema, Types } from "mongoose";

// Interface for a like model's attributes
interface LikeAttributes {
    post: Types.ObjectId,
    user: Types.ObjectId,
}

// Schema for a like model
const likeModelSchema = new Schema<LikeAttributes>(
    {
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

// Like model
const LikeModel = mongoose.model('Like', likeModelSchema);

export default LikeModel;
export { LikeAttributes };