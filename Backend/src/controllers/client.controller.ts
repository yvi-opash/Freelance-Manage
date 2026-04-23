import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {createClients, deleteClients, getClientById, getClients, updateClients} from "../services/client.service";


export const createClient = async (req: AuthRequest, res: Response) => {
    try {
        const client = await createClients(req.user!.id, req.body);
        res.status(201).json(client);
    } catch (error: any) {
        res.status(400).json({ message: error.message })
    }
}

export const getClient = async (req: AuthRequest, res: Response) => {
    try {
        const clients = await getClients(req.user!.id);
        res.json(clients);

    } catch (error : any) {
        res.status(400).json({ message: error.message })
    }
};

export const clientbyId = async (req: AuthRequest, res: Response) => {
    try {
        const client = await getClientById(
            req.user!.id,
            req.params.id as string
        );
        res.json(client);
    } catch (error : any) {
        res.status(400).json({ message: error.message })
    }
}

export const updateClient = async (req: AuthRequest, res: Response) => {
  const updated = await updateClients(
    req.user!.id,
    req.params.id as string,
    req.body
  );
  res.json(updated);
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
    try {
        await deleteClients(
            req.user!.id,
            req.params.id as string
        );
        res.json({ message: "Client deleted" });
    } catch (error: any) {
        res.status(400).json({ message: error.message })
    }
}

