import path from "path";

// Interface for photos'config
interface PhotoConfig {
    storagePath: string,
    urlPath: string
}

// Photo config for the users'photos
const usersPhotoConfig: PhotoConfig = {
    storagePath: path.join(__dirname, "../", "static", "users"),
    urlPath: "/public/users"
}

export { usersPhotoConfig };