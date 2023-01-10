"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
// App error
const AppError_class_1 = __importDefault(require("./@types/AppError-class"));
// Controllers
const users_controller_1 = __importDefault(require("./controllers/users-controller"));
const posts_controller_1 = __importDefault(require("./controllers/posts-controller"));
const categories_controller_1 = __importDefault(require("./controllers/categories-controller"));
// Middlewares
const validateSignupUser_middle_1 = __importDefault(require("./middlewares/validateSignupUser-middle"));
const validateUpdateUser_middle_1 = __importDefault(require("./middlewares/validateUpdateUser-middle"));
const validateUpdatePassword_middle_1 = __importDefault(require("./middlewares/validateUpdatePassword-middle"));
const validatePost_middle_1 = __importStar(require("./middlewares/validatePost-middle"));
const validateComment_middle_1 = __importDefault(require("./middlewares/validateComment-middle"));
const uploadUserPhoto_middle_1 = __importDefault(require("./middlewares/uploadUserPhoto-middle"));
const uploadPostPhoto_middle_1 = __importDefault(require("./middlewares/uploadPostPhoto-middle"));
const routeAuth_middle_1 = require("./middlewares/routeAuth-middle");
// Express application
const app = (0, express_1.default)();
// Handling CORS
app.use((0, cors_1.default)());
// Body parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
/*
** ROUTES ****************************************************************************
*/
// Static files
app.use('/public', express_1.default.static(path_1.default.join(__dirname, "../", 'static')));
/* USERS ************************************************************/
// Gets users
app.get('/api/users', users_controller_1.default.getUsers);
// Gets a user
app.get('/api/users/:userId', (0, routeAuth_middle_1.authenticateRouteUser)(false), users_controller_1.default.getUser);
// Updates a user's photo
app.put("/api/users/:userId/photo", (0, routeAuth_middle_1.authenticateRouteUser)(), uploadUserPhoto_middle_1.default, users_controller_1.default.updateUserPhoto);
// Updates a user's data
app.put("/api/users/:userId", (0, routeAuth_middle_1.authenticateRouteUser)(), validateUpdateUser_middle_1.default, users_controller_1.default.updateUser);
// Updates a user's password
app.put("/api/users/:userId/password", (0, routeAuth_middle_1.authenticateRouteUser)(), validateUpdatePassword_middle_1.default, users_controller_1.default.updateUserPassword);
// Deletes a user's photo
app.delete("/api/users/:userId/photo", (0, routeAuth_middle_1.authenticateRouteUser)(), users_controller_1.default.updateUserPhoto);
// Deletes a user
app.delete("/api/users/:userId", (0, routeAuth_middle_1.authenticateRouteUser)(), users_controller_1.default.deleteUser);
// Gets a user's followings
app.get('/api/users/:userId/followings', users_controller_1.default.getFollowings);
// Adds a following
app.post('/api/users/:userId/followings', (0, routeAuth_middle_1.authenticateRouteUser)(), users_controller_1.default.addFollowing);
// Removes a following
app.delete('/api/users/:userId/followings/:followingId', (0, routeAuth_middle_1.authenticateRouteUser)(), users_controller_1.default.removeFollowing);
/********************************************************************/
/* AUTH *************************************************************/
// Signs up a user
app.post('/api/signup', validateSignupUser_middle_1.default, users_controller_1.default.signupUser);
// Logs in a user
app.post('/api/login', users_controller_1.default.login);
// Gets a user from token
app.get('/api/tokenUser', (0, routeAuth_middle_1.authenticateRouteUser)(), users_controller_1.default.getUserFromToken);
/********************************************************************/
/* POSTS ************************************************************/
// Gets posts under pagination
app.get('/api/posts', posts_controller_1.default.getPaginatedPosts);
// Gets a post
app.get('/api/posts/:postId', (0, routeAuth_middle_1.authenticateRouteUser)(false), posts_controller_1.default.getPost);
// Adds a post
app.post('/api/posts', (0, routeAuth_middle_1.authenticateRouteUser)(), uploadPostPhoto_middle_1.default, validatePost_middle_1.default, posts_controller_1.default.addPost);
// Updates a post's title and content
app.put('/api/posts/:postId/text', (0, routeAuth_middle_1.authenticateRouteUser)(), validatePost_middle_1.validatePostTitleContentUpdate, posts_controller_1.default.updatePostTitleAndContent);
// Updates a post's categories
app.put('/api/posts/:postId/categories', (0, routeAuth_middle_1.authenticateRouteUser)(), validatePost_middle_1.validatePostCategoriesUpdate, posts_controller_1.default.updatePostCategories);
// Deletes a post
app.delete('/api/posts/:postId', (0, routeAuth_middle_1.authenticateRouteUser)(), posts_controller_1.default.deletePost);
// Gets a post's paginated likes
app.get('/api/posts/:postId/likes', posts_controller_1.default.getPostPaginatedLikes);
// Add a like to a post from a user
app.post('/api/posts/:postId/likes', (0, routeAuth_middle_1.authenticateRouteUser)(), posts_controller_1.default.addLikeToPost);
// Removes a like from a post
app.delete('/api/posts/:postId/likes/:likeId', (0, routeAuth_middle_1.authenticateRouteUser)(), posts_controller_1.default.removeLikeFromPost);
// Gets a post's paginated comments
app.get('/api/posts/:postId/comments', posts_controller_1.default.getPostPaginatedComments);
// Adds a comment to a post
app.post('/api/posts/:postId/comments', (0, routeAuth_middle_1.authenticateRouteUser)(), validateComment_middle_1.default, posts_controller_1.default.addCommentToPost);
// Updates a comment's content
app.patch('/api/posts/:postId/comments/:commentId', (0, routeAuth_middle_1.authenticateRouteUser)(), validateComment_middle_1.default, posts_controller_1.default.updateCommentContent);
// Deletes a comment
app.delete('/api/posts/:postId/comments/:commentId', (0, routeAuth_middle_1.authenticateRouteUser)(), posts_controller_1.default.deleteComment);
/********************************************************************/
/* CATEGORIES *******************************************************/
// Gets categories
app.get('/api/categories', categories_controller_1.default.getCategories);
/********************************************************************/
/*
** ***********************************************************************************
*/
// Error handler
const requestErrorHandler = (err, req, res, next) => {
    console.log(err.message);
    if (err instanceof AppError_class_1.default) {
        const responseData = {
            message: err.message
        };
        if (err.payload)
            responseData.payload = err.payload;
        return res.status(err.status).json(responseData);
    }
    next(err);
};
app.use(requestErrorHandler);
exports.default = app;
