import { Request, Response, NextFunction } from "express";

// Express middleware type
type Middleware = (req: Request, res: Response, next: NextFunction) => void;

export default Middleware;