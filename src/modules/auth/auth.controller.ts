import { type Response, type Request, type NextFunction } from "express";
import type { ILoginParams, IRegisterParams } from "./auth.interface.js";
import { authService } from "./auth.service.js";

class AuthController {
  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.validated!.body as IRegisterParams;
      const data = await authService.Register(payload);
      res.status(201).json({
        message: "User registered successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.validated!.body as ILoginParams;
      const data = await authService.Login(payload);

      res.status(201).json({ message: "Login Success!", data });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
