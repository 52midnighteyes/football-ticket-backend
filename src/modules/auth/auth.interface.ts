import type { UserRole } from "../../../generated/prisma/enums.js";

export interface IRegisterParams {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
}
