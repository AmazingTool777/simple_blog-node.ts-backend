import { Request, Response, NextFunction } from "express";

// App error class
import AppError from "../@types/AppError-class";

// JWT helper
import { jwtVerify } from "../helpers/jwt-helper";

// Authenticates a user based on jwt then authorizes them is required
const authenticateRouteUser = async (req: Request, res: Response, next: NextFunction) => {
    // Extracting the token from header
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token)
        return next(new AppError(401, `An access-token is required`, undefined)); // Unauthorized

    // Checking if the token is invalid
    let userPayload;
    try {
        userPayload = await jwtVerify(token, "user");
    }
    catch (error) {
        // Unauthorized
        return next(new AppError(401, `The access-token is is not valid`, undefined));
    }

    // Saving the user payload and the inside the response object's locals
    res.locals.authUser = userPayload;
    res.locals.token = token;

    next();
}


export { authenticateRouteUser }; 