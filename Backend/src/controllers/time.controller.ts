import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createTimeEntry,
  getTimeEntries,
  deleteTimeEntry,
  startTimeEntry,
  stopTimeEntry,
} from "../services/timeentry.service";

export const createTimeEntryController = async (req: AuthRequest, res: Response) => {
  try {
    const entry = await createTimeEntry(req.user!.id, req.body);
    res.status(201).json(entry);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getTimeEntry = async (req: AuthRequest, res: Response) => {
  try {
    const entries = await getTimeEntries(req.user!.id);
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTimeEntryController = async (req: AuthRequest, res: Response) => {
  try {
    await deleteTimeEntry(req.user!.id, req.params.id as string);
    res.json({ message: "Time entry deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const startTimer = async (req: AuthRequest, res: Response) => {
  try {
    const entry = await startTimeEntry(req.user!.id, req.body);
    res.status(201).json(entry);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const stopTimer = async (req: AuthRequest, res: Response) => {
  try {
    const entry = await stopTimeEntry(req.user!.id, req.params.id as string);
    res.json(entry);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};