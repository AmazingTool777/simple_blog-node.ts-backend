"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateRouteUser = void 0;
// App error class
const AppError_class_1 = __importDefault(require("../@types/AppError-class"));
// JWT helper
const jwt_helper_1 = require("../helpers/jwt-helper");
// Authenticates a user based on jwt then authorizes them is required
const authenticateRouteUser = (isRequired = true) => async (req, res, next) => {
    // Extracting the token from header
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token && isRequired)
        return next(new AppError_class_1.default(401, `An access-token is required`, undefined)); // Unauthorized
    // Checking if the token is invalid
    let userPayload;
    if (token) {
        try {
            userPayload = await (0, jwt_helper_1.jwtVerify)(token, "user");
        }
        catch (error) {
            // Unauthorized
            return next(new AppError_class_1.default(401, `The access-token is is not valid`, undefined));
        }
    }
    // Saving the user payload and the inside the response object's locals
    res.locals.authUser = userPayload || null;
    res.locals.token = token || null;
    next();
};
exports.authenticateRouteUser = authenticateRouteUser;
