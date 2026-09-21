import type { Entity, Order, Product } from "./models";

export class DataStore<T extends Entity> {
  private items: T[] = [];

  add(item: T): T {
    this.items.push(item);
    return item;
  }

  list(): T[] {
    return [...this.items];
  }

  getById(id: string): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  update(id: string, updates: Partial<T>): T | undefined {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return undefined;
    }

    this.items[index] = {
      ...this.items[index],
      ...updates,
    };

    return this.items[index];
  }

  delete(id: string): T | undefined {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return undefined;
    }

    const [deletedItem] = this.items.splice(index, 1);
    return deletedItem;
  }
}

export interface AppState {
  products: DataStore<Product>;
  orders: DataStore<Order>;
}

export const productStore = new DataStore<Product>();
export const orderStore = new DataStore<Order>();

export const appState: AppState = {
  products: productStore,
  orders: orderStore,
};

export function seedSampleData(): void {
  if (productStore.list().length > 0 || orderStore.list().length > 0) {
    return;
  }

  productStore.add({
    id: "1",
    name: "Laptop",
    category: "electronics",
    price: 999,
    stock: 10,
  });

  productStore.add({
    id: "2",
    name: "Novel",
    category: "books",
    price: 25,
    stock: 5,
  });

  orderStore.add({
    id: "order-1",
    items: [{ productId: "1", quantity: 2 }],
    status: "paid",
    total: 1998,
    createdAt: new Date().toISOString(),
  });

  orderStore.add({
    id: "order-2",
    items: [{ productId: "2", quantity: 1 }],
    status: "cancelled",
    total: 25,
    createdAt: new Date().toISOString(),
  });
}
