import mongoose, { Schema, Types } from "mongoose";

// Network config
import networkConfig from "../configs/network-config";

// Interface for a user model's attributes
interface UserAttributes {
    firstName: string,
    lastName: string,
    gender: string,
    email: string,
    password: string,
    photoPath?: string | null,
    photoURL?: string | null,
    posts: Types.ObjectId[]
}

// Schema for a user model
const userModelSchema = new Schema<UserAttributes>(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        gender: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        photoPath: String
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        timestamps: true
    }
);

// Virtual full photo URL
userModelSchema.virtual('photoURL').get(function (this: UserAttributes) {
    return this.photoPath ? `${networkConfig.url}${this.photoPath}` : null;
});

// User model
const UserModel = mongoose.model('User', userModelSchema);

export default UserModel;
export { UserAttributes };