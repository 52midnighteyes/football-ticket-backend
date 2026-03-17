import * as z from "zod";
import { userRoles } from "../../enum/userRole.enum.js";

// export interface IUserParams {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   role: string;
// }

export const verifiedTokenSchema = z.object({
  id: z.uuid().nonempty("User ID is required"),
  email: z.email().nonempty,
  firstName: z.string().nonempty("First name is required").trim(),
  lastName: z.string().nonempty,
  role: z.enum(userRoles, {
    message:
      "user role from token is invalid. role has to be one of the following: " +
      userRoles.join(", "),
  }),
});
