import type { Request, Response } from "express";
import { prisma } from "../db";
import { Role } from "../../generated/prisma/client";
import { orderSchema } from "../schemas/order.schema";
import { ApiError } from "../utils/api-error";

export async function createOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = req.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required.");
  }

  const parsed = orderSchema.parse(req.body);

  const quantities = new Map<string, number>();

  for (const item of parsed.items) {
    const quantity =
      (quantities.get(item.productId) ?? 0) +
      item.quantity;

    if (!Number.isSafeInteger(quantity)) {
      throw new ApiError(400, "Combined product quantity is too large.");
    }

    quantities.set(item.productId, quantity);
  }

  const orderItems = [...quantities].map(
    ([productId, quantity]) => ({
      productId,
      quantity,
    }),
  );

  const order = await prisma.$transaction(
    async (transaction) => {
      const products = await transaction.product.findMany({
        where: {
          id: {
            in: orderItems.map((item) => item.productId),
          },
        },
        select: {
          id: true,
          price: true,
        },
      });

      const productsById = new Map(
        products.map((product) => [product.id, product]),
      );

      if (products.length !== orderItems.length) {
        throw new ApiError(
          400,
          "One or more product IDs are invalid.",
        );
      }

      let total = 0;

      const itemsWithPrices = orderItems.map((item) => {
        const product = productsById.get(item.productId);

        if (!product) {
          throw new ApiError(
            400,
            "One or more product IDs are invalid.",
          );
        }

        total += product.price * item.quantity;

        return {
          ...item,
          unitPrice: product.price,
        };
      });

      for (const item of itemsWithPrices) {
        const deduction =
          await transaction.product.updateMany({
            where: {
              id: item.productId,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });

        if (deduction.count !== 1) {
          throw new ApiError(
            409,
            `Insufficient stock for product ${item.productId}.`,
          );
        }
      }

      return transaction.order.create({
        data: {
          userId: auth.userId,
          total,
          items: {
            create: itemsWithPrices,
          },
        },
        include: {
          items: true,
        },
      });
    },
  );

  res.status(201).json(order);
}

export async function listOrders(
  req: Request,
  res: Response,
): Promise<void> {
  const auth = req.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required.");
  }

  const orders = await prisma.order.findMany({
    where:
      auth.role === Role.ADMIN
        ? undefined
        : { userId: auth.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(orders);
}