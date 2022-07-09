import mongoose, { Schema, Types } from "mongoose";

// Interface for a following model's attributes
interface FollowingAttributes {
    followerId: Types.ObjectId,
    followedId: Types.ObjectId,
}

// Schema for a Following model
const followingModelSchema = new Schema<FollowingAttributes>(
    {
        followerId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        followedId: {
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

// Following model
const FollowingModel = mongoose.model('Following', followingModelSchema);

export default FollowingModel;
export { FollowingAttributes };