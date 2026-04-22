import { generateResetToken, loginUser, registerUser } from '../services/auth.service';
import { Request, Response } from "express";


export const register = async (req: Request, res: Response) => {
    try {
        const user = await registerUser(req.body)
        res.status(201).json(user)
    } catch (error: any) {
        res.status(400).json({ message: error.message })
    }
}

export const login = async (req: Request, res: Response) => {
  try {
      const data = await loginUser(
        req.body.email,
        req.body.password
    );
    res.json(data);
  } catch (error: any) {
      res.status(400).json({ message: error.message })
  }
}


export const forgotPassword = async (req: Request, res: Response) => {
    try {
        await generateResetToken(req.body.email);
        res.json({ message: "Reset token generated. Check console for the token." });
    } catch (error: any) {
        res.status(400).json({ message: error.message })
    }
}


export const resetPassword = async (req: Request, res: Response) => {
    try {
        await resetPassword(
            req.body.token,
            req.body.newPassword
        )
        res.json({ message: "Password reset successful." });
    } catch (error: any) {
        res.status(400).json({ message: error.message })
    }
}
