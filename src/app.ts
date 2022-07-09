import path from "path";
import cors from "cors";
import express, { ErrorRequestHandler } from "express";

// App error
import AppError from "./@types/AppError-class";

// Controllers
import UsersController from "./controllers/users-controller";
import PostsController from "./controllers/posts-controller";
import CategoriesController from "./controllers/categories-controller";

// Middlewares
import validateSignupUser from "./middlewares/validateSignupUser-middle";
import validateUpdateUser from "./middlewares/validateUpdateUser-middle";
import validateUpdatePassword from "./middlewares/validateUpdatePassword-middle";
import validatePost, { validatePostTitleContentUpdate, validatePostCategoriesUpdate } from "./middlewares/validatePost-middle";
import validateComment from "./middlewares/validateComment-middle";
import uploadUserPhoto from "./middlewares/uploadUserPhoto-middle";
import uploadPostPhoto from "./middlewares/uploadPostPhoto-middle";
import { authenticateRouteUser } from "./middlewares/routeAuth-middle";

// Express application
const app = express();

// Handling CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


/*
** ROUTES ****************************************************************************
*/

// Static files
app.use('/public', express.static(path.join(__dirname, "../", 'static')));


/* USERS ************************************************************/

// Gets users
app.get('/api/users', UsersController.getUsers);

// Gets a user
app.get('/api/users/:userId', UsersController.getUser);

// Updates a user's photo
app.put("/api/users/:userId/photo", authenticateRouteUser(), uploadUserPhoto, UsersController.updateUserPhoto);

// Updates a user's data
app.put("/api/users/:userId", authenticateRouteUser(), validateUpdateUser, UsersController.updateUser);

// Updates a user's password
app.put("/api/users/:userId/password", authenticateRouteUser(), validateUpdatePassword, UsersController.updateUserPassword);

// Deletes a user's photo
app.delete("/api/users/:userId/photo", authenticateRouteUser(), UsersController.updateUserPhoto);

// Deletes a user
app.delete("/api/users/:userId", authenticateRouteUser(), UsersController.deleteUser);

/********************************************************************/


/* AUTH *************************************************************/

// Signs up a user
app.post('/api/signup', validateSignupUser, UsersController.signupUser);

// Logs in a user
app.post('/api/login', UsersController.login);

// Gets a user from token
app.get('/api/tokenUser', authenticateRouteUser(), UsersController.getUserFromToken);

/********************************************************************/


/* POSTS ************************************************************/

// Gets posts under pagination
app.get('/api/posts', PostsController.getPaginatedPosts);

// Gets a post
app.get('/api/posts/:postId', authenticateRouteUser(false), PostsController.getPost);

// Adds a post
app.post('/api/posts', authenticateRouteUser(), uploadPostPhoto, validatePost, PostsController.addPost);

// Updates a post's title and content
app.put('/api/posts/:postId/text', authenticateRouteUser(), validatePostTitleContentUpdate, PostsController.updatePostTitleAndContent);

// Updates a post's categories
app.put('/api/posts/:postId/categories', authenticateRouteUser(), validatePostCategoriesUpdate, PostsController.updatePostCategories);

// Deletes a post
app.delete('/api/posts/:postId', authenticateRouteUser(), PostsController.deletePost);

// Add a like to a post from a user
app.post('/api/posts/:postId/likes', authenticateRouteUser(), PostsController.addLikeToPost);

// Removes a like from a post
app.delete('/api/posts/:postId/likes/:likeId', authenticateRouteUser(), PostsController.removeLikeFromPost);

// Gets a post's paginated comments
app.get('/api/posts/:postId/comments', PostsController.getPostPaginatedComments);

// Adds a comment to a post
app.post('/api/posts/:postId/comments', authenticateRouteUser(), validateComment, PostsController.addCommentToPost);

// Updates a comment's content
app.patch('/api/posts/:postId/comments/:commentId', authenticateRouteUser(), validateComment, PostsController.updateCommentContent);

// Deletes a comment
app.delete('/api/posts/:postId/comments/:commentId', authenticateRouteUser(), PostsController.deleteComment);

/********************************************************************/


/* CATEGORIES *******************************************************/

// Gets categories
app.get('/api/categories', CategoriesController.getCategories);

/********************************************************************/


/*
** ***********************************************************************************
*/

// Error handler
const requestErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.log(err.message);
    if (err instanceof AppError) {
        const responseData: { message: string, payload?: any } = {
            message: err.message
        }
        if (err.payload) responseData.payload = err.payload;
        return res.status(err.status).json(responseData);
    }
    next(err);
}
app.use(requestErrorHandler);

export default app;
