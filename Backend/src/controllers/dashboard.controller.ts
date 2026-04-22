import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {getDashboard} from "../services/dashboard.service";

export const dashboard = async (req: AuthRequest, res: Response) => {
    const data = await getDashboard(req.user!.id);
    res.json(data);
}
