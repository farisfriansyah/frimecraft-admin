import { z } from "zod";

export const loginPayloadSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(190),
  password: z.string().min(1).max(200),
});

export const companyPayloadSchema = z.object({
  name: z.string().trim().min(2).max(120),
});
