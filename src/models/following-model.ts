import mongoose, { Schema, Types } from "mongoose";

// Interface for a following model's attributes
interface FollowingAttributes {
    follower: Types.ObjectId,
    followedUser: Types.ObjectId,
}

// Schema for a Following model
const followingModelSchema = new Schema<FollowingAttributes>(
    {
        follower: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        followedUser: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
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