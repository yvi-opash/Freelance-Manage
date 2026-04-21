import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export  interface AuthRequest extends Request{
    user? : {id : string}
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        req.user = { id: decode.id };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}