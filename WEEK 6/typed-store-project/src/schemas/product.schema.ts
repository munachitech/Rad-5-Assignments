import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1),
  category: z.enum(["electronics", "books", "clothing", "home"]),
  price: z.number().finite().positive(),
  stock: z.number().int().nonnegative(),
});

export const productUpdateSchema = productSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one product field must be provided.",
  });