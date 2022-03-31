import path from "path";
import multer, { diskStorage, FileFilterCallback, MulterError } from "multer";
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";

// App error class
import AppError from "../@types/AppError-class";

// Returns the image uploader middleware by taking in a few parameters
const imageUploader = (field: string, storagePath: string, isArray: boolean = false) => {
    // Multer disk storage
    const storage = diskStorage({
        destination: storagePath,
        filename: (req, file, cb) => {
            cb(null, `${file.fieldname}-${uuidv4()}${path.extname(file.originalname)}`);
        }
    });

    // Limits
    const limits = { fieldSize: 5000000 }; // 5mb as a maximum size

    // Image filter
    const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        // Regex pattern for the allowed image extensions
        const allowedExt = /jpg|jpeg|png|gif|svg/i;
        // Checking the correctness of the file extension
        const extIsCorrect = allowedExt.test(path.extname(file.originalname));
        // Checking the correctness of the file's mimetype
        const mimeTypeIsCorrect = allowedExt.test(file.mimetype);

        if (extIsCorrect && mimeTypeIsCorrect)
            cb(null, true); // Image can be uploaded
        else
            cb(new AppError(400, 'Only images are allowed', undefined)); // File extension is not allowed
    }

    return (req: Request, res: Response, next: NextFunction) => {
        // Multer uploader middleware
        const uploader = isArray
            ? multer({ storage, limits, fileFilter }).array(field)
            : multer({ storage, limits, fileFilter }).single(field);

        // Uploading
        uploader(req, res, (err) => {
            if (err) {
                if (err instanceof MulterError)
                    return next(err); // Upload error
                else
                    return next(new AppError(500, err.message, undefined)); // Unknown error
            }
            if (!req.file)
                return next(new AppError(400, 'You must provide an image', undefined)); // File missing
            next();
        });
    }
}

export default imageUploader;