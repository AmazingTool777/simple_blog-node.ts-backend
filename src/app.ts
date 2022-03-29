import path from "path";
import express, { ErrorRequestHandler, Request, Response, NextFunction } from "express";

// App error
import AppError from "./@types/AppError-class";

// Express application
const app = express();


/*
** ROUTES ****************************************************************************
*/

// Static files
app.use('/public', express.static(path.join(__dirname, 'static')));

app.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.send('Hello world');
    } catch (error) {
        next(error);
    }
});

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
