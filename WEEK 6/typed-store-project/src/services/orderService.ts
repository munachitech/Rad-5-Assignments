import type { OrderError, StorageError } from "../errors";
import type { Order, OrderItem } from "../models";
import { fail, ok, type Result } from "../result";
import { orderStore, productStore } from "../state";

function createOrderId(): string {
  return `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function placeOrder(items: OrderItem[]): Result<Order, OrderError | StorageError> {
  if (items.length === 0) {
    return fail({
      kind: "order",
      code: "empty-items",
      message: "An order must contain at least one item.",
    });
  }

  let total = 0;

  for (const item of items) {
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      return fail({
        kind: "order",
        code: "invalid-quantity",
        message: "Every quantity must be greater than zero.",
        productId: item.productId,
      });
    }

    const product = productStore.getById(item.productId);

    if (!product) {
      return fail({
        kind: "order",
        code: "product-not-found",
        message: `Product ${item.productId} does not exist.`,
        productId: item.productId,
      });
    }

    if (product.stock < item.quantity) {
      return fail({
        kind: "order",
        code: "insufficient-stock",
        message: `Not enough stock for product ${product.name}.`,
        productId: product.id,
        available: product.stock,
        requested: item.quantity,
      });
    }

    total += product.price * item.quantity;
  }

  const order: Order = {
    id: createOrderId(),
    items,
    status: "pending",
    total,
    createdAt: new Date().toISOString(),
  };

  for (const item of items) {
    const product = productStore.getById(item.productId);

    if (!product) {
      return fail({
        kind: "order",
        code: "product-not-found",
        message: `Product ${item.productId} does not exist.`,
        productId: item.productId,
      });
    }

    const updatedProduct = productStore.update(product.id, {
      stock: product.stock - item.quantity,
    });

    if (!updatedProduct) {
      return fail({
        kind: "storage",
        code: "save-failed",
        message: `Could not update stock for product ${product.id}.`,
      });
    }
  }

  return ok(orderStore.add(order));
}

export const orderService = {
  placeOrder,
};
