import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {createTimeEntrys, getTimeEntries, deleteTimeEntrys} from "../services/timeentry.service";


export const createTimeEntry = async (req: AuthRequest, res: Response) => {
    try {
        const entry = await createTimeEntrys(req.user!.id, req.body);
        res.status(201).json(entry);
    } catch (error : any) {
        res.status(400).json({ message: error.message });
    }
}

export const getTimeEntry = async (req: AuthRequest, res: Response) => {
    
        const entries = await getTimeEntries(req.user!.id);
        res.json(entries);
    } 

export const deleteTimeEntry = async (req: AuthRequest, res: Response) => {

  await deleteTimeEntrys(
    req.user!.id, 
    req.params.id as string
    );
  res.json({ message: "Time entry deleted" });
};