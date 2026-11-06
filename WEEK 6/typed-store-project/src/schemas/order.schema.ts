import { z } from "zod";
import { objectIdSchema } from "../utils/validation";

export const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: objectIdSchema,
      quantity: z.number().int().positive().safe(),
    }),
  ).min(1),
});