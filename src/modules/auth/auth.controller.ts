import { type Response, type Request, type NextFunction } from "express";
import type { IRegisterParams } from "./auth.interface.js";
import { authService } from "./auth.service.js";

class AuthController {
  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body as IRegisterParams;
      const response = await authService.userRegister(payload);
      res.status(201).json({
        message: "User registered successfully",
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
