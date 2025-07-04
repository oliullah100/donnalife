import { z } from "zod";

const createUser = z.object({
  password: z.string({ required_error: "Password must be set" }),
  planId: z.string({ required_error: "Plan Id must be set" }).optional(),
  user: z.object({
    name: z.string({ required_error: "Name is required" }),
    email: z.string({ required_error: "Email is required" }),
    contactNumber: z.string({ required_error: "Phone is required" }),
  }),
});

export const UserValidation = { createUser };
