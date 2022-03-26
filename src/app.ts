import express, { Request, Response, NextFunction } from "express";

// Express application
const app = express();


/*
** ROUTES ****************************************************************************
*/

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
