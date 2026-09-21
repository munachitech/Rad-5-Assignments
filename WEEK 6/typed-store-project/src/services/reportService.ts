import type { LowStockItem, OrderSummary } from "../models";
import { orderStore, productStore } from "../state";

export function getLowStockReport(threshold: number): LowStockItem[] {
  if (!Number.isFinite(threshold) || threshold < 0) {
    return [];
  }

  return productStore
    .list()
    .filter((product) => product.stock <= threshold)
    .map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      threshold,
    }));
}

export function getTopSellers(): Array<{ productId: string; productName: string; totalSold: number }> {
  const totals = new Map<string, number>();

  for (const order of orderStore.list()) {
    if (order.status === "cancelled") {
      continue;
    }

    for (const item of order.items) {
      const currentTotal = totals.get(item.productId) ?? 0;
      totals.set(item.productId, currentTotal + item.quantity);
    }
  }

  return Array.from(totals.entries())
    .map(([productId, totalSold]) => ({
      productId,
      productName: productStore.getById(productId)?.name ?? "Unknown product",
      totalSold,
    }))
    .sort((left, right) => right.totalSold - left.totalSold);
}

export function getOrderSummaries(): OrderSummary[] {
  return orderStore.list().map((order) => ({
    id: order.id,
    status: order.status,
    total: order.total,
  }));
}

export const reportService = {
  getLowStockReport,
  getTopSellers,
  getOrderSummaries,
};
