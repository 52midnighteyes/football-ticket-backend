import * as z from "zod";
import { userRoles } from "../../enum/userRole.enum.js";

export const registerSchema = z.object({
  email: z
    .email("Email format is invalid")
    .nonempty("Email is required")
    .trim(),
  firstName: z.string().nonempty("First name is required").trim(),
  lastName: z.string().nonempty("Last name is required").trim(),
  password: z
    .string()
    .nonempty("Password is required")
    .max(20, "Password must not exceed 20 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 number, and 1 special character",
    ),
  role: z.enum(userRoles, {
    message: "Role is invalid",
  }),
});

export const loginSchema = z.object({
  email: z
    .email("Email format is invalid")
    .nonempty("Email is required")
    .trim(),
  password: z.string().nonempty("Password is required"),
});
