import path from "path";
import cors from "cors";
import express, { ErrorRequestHandler, Request, Response, NextFunction } from "express";

// App error
import AppError from "./@types/AppError-class";

// Controllers
import UsersController from "./controllers/users-controller";

// Middlewares
import validateSignupUser from "./middlewares/validateSignupUser-middle";

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
app.use('/public', express.static(path.join(__dirname, 'static')));

// Gets users
app.get('/api/users', UsersController.getUsers);

// Gets a user
app.get('/api/users/:userId', UsersController.getUser);

// Signs up a user
app.post('/api/signup', validateSignupUser, UsersController.signupUser);

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
    next();
}
app.use(requestErrorHandler);

export default app;
