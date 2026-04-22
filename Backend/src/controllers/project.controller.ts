import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {createProjects, deleteProjects, getProjects, updateProjects} from '../services/project.service';

export const createProject = async (req: AuthRequest, res: Response) => {
    try {
        const project = await createProjects(
            req.user!.id,
            req.body

        )
        res.status(201).json(project);
    } catch (error : any) {
        res.status(400).json({ message: error.message })
    }
}

export const getProject = async (req: AuthRequest, res: Response) => {
    try {
        const projects = await getProjects(
            req.user!.id,
        )
        res.json(projects);
    } catch (error: any) {
        res.status(400).json({ message: error.message })
    }
}

export const updateProject = async (req: AuthRequest, res: Response) => {
    try {
        const updated = await updateProjects(
            req.user!.id,
            req.params.id as string,
            req.body
        )
        res.json(updated);
    
        
    } catch (error : any) {
       res.status(400).json({ message: error.message }); 
    }
}

export const deleteProject = async (req: AuthRequest, res: Response) => {
    try { 
        const deleted = await deleteProjects(
            req.user!.id,
            req.params.id as string
        )
        res.json(deleted);
    } catch (error : any) {
        res.status(400).json({ message: error.message });
    }
}
