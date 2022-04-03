import { Request, Response, NextFunction } from "express";

// Storage path for posts photos
import { postsPhotoConfig } from "../configs/photos-config";

// Image uploader middleware
import imageUploader from "./imageUploader-middle";

// Post photo uploader middleware
const uploadPostPhoto = (req: Request, res: Response, next: NextFunction) => {
    imageUploader("photo", postsPhotoConfig.storagePath)(req, res, next);
}

export default uploadPostPhoto;