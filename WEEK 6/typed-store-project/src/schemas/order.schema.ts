import { z } from "zod";

export const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().trim().min(1),
      quantity: z.number().int().positive().safe(),
    }),
  ).min(1),
});