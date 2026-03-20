import type { UserRole } from "../../../generated/prisma/enums.js";

export interface IRegisterParams {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
}

export interface ILoginParams {
  email: string;
  password: string;
}

export interface ICreateRefreshTokenDbParams {
  userId: string;
  hashedToken: string;
  expiresAt: Date;
}
