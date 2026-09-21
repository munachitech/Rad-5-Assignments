export type Category = "electronics" | "books" | "clothing" | "home";

export interface Entity {
  id: string;
}

export interface Product extends Entity {
  name: string;
  category: Category;
  price: number;
  stock: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export type OrderStatus = "pending" | "paid" | "cancelled";

export interface Order extends Entity {
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: string;
}

export type CreateProductInput = Omit<Product, "id">;
export type UpdateProductInput = Partial<Omit<Product, "id">>;

export type OrderSummary = Pick<Order, "id" | "status" | "total">;
export type StockLevels = Record<string, number>;

export interface LowStockItem extends Pick<Product, "id" | "name" | "stock"> {
  threshold: number;
}
