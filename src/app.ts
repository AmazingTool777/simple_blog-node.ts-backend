import path from "path";
import express, { Request, Response, NextFunction } from "express";

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

export default app;
