import fs from "fs";
import path from "path";

// Deletes an api resource's photo
const deleteApiPhoto = (storagePath: string, apiPath: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const filename = apiPath.slice(apiPath.search(/((\w|\d|-)+\.(jpg|jpeg|png|gif|svg))$/));
        fs.unlink(path.join(storagePath, filename), (error) => {
            if (error) reject(error);
            else resolve();
        });
    });
}

export default deleteApiPhoto;