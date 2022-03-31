import { Request, Response, NextFunction } from "express";

// Storage path for user photos
import { usersPhotoConfig } from "../configs/photos-config";

// Image uploader middleware
import imageUploader from "./imageUploader-middle";

// User photo uploader middleware
const uploadUserPhoto = (req: Request, res: Response, next: NextFunction) => {
    imageUploader("photo", usersPhotoConfig.storagePath)(req, res, next);
}

export default uploadUserPhoto;