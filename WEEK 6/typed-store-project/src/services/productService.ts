import type { ProductError, StorageError } from "../errors";
import type {
  CreateProductInput,
  LowStockItem,
  Product,
  StockLevels,
  UpdateProductInput,
} from "../models";
import { fail, ok, type Result } from "../result";
import { productStore } from "../state";

function isValidCategory(value: string): boolean {
  return (
    value === "electronics" ||
    value === "books" ||
    value === "clothing" ||
    value === "home"
  );
}

function isValidProductName(name: string): boolean {
  return name.trim().length > 0;
}

function isValidPrice(price: number): boolean {
  return Number.isFinite(price) && price > 0;
}

function isValidStock(stock: number): boolean {
  return Number.isFinite(stock) && stock >= 0;
}

function nextProductId(): string {
  return String(productStore.list().length + 1);
}

export function createProduct(input: CreateProductInput): Result<Product, ProductError> {
  const name = input.name.trim();

  if (!isValidProductName(name)) {
    return fail({
      kind: "product",
      code: "invalid-input",
      message: "Product name is required.",
      field: "name",
    });
  }

  if (!isValidCategory(input.category)) {
    return fail({
      kind: "product",
      code: "invalid-input",
      message: "Category must be one of electronics, books, clothing, or home.",
      field: "category",
    });
  }

  if (!Number.isFinite(input.price) || input.price <= 0) {
    return fail({
      kind: "product",
      code: "invalid-input",
      message: "Price must be greater than zero.",
      field: "price",
    });
  }

  if (!isValidStock(input.stock)) {
    return fail({
      kind: "product",
      code: "invalid-input",
      message: "Stock must be zero or greater.",
      field: "stock",
    });
  }

  const duplicateExists = productStore
    .list()
    .some((product) => product.name.toLowerCase() === name.toLowerCase());

  if (duplicateExists) {
    return fail({
      kind: "product",
      code: "duplicate-name",
      message: `A product named "${name}" already exists.`,
      name,
    });
  }

  const product: Product = {
    id: nextProductId(),
    name,
    category: input.category,
    price: input.price,
    stock: input.stock,
  };

  return ok(productStore.add(product));
}

export function updateProduct(
  productId: string,
  updates: UpdateProductInput,
): Result<Product, ProductError | StorageError> {
  const currentProduct = productStore.getById(productId);

  if (!currentProduct) {
    return fail({
      kind: "product",
      code: "not-found",
      message: `Product ${productId} was not found.`,
      productId,
    });
  }

  if (updates.name !== undefined) {
    const newName = updates.name.trim();

    if (!isValidProductName(newName)) {
      return fail({
        kind: "product",
        code: "invalid-input",
        message: "Product name is required.",
        field: "name",
      });
    }
  }

  if (updates.category !== undefined && !isValidCategory(updates.category)) {
    return fail({
      kind: "product",
      code: "invalid-input",
      message: "Category must be one of electronics, books, clothing, or home.",
      field: "category",
    });
  }

  if (updates.price !== undefined && !isValidPrice(updates.price)) {
    return fail({
      kind: "product",
      code: "invalid-input",
      message: "Price must be greater than zero.",
      field: "price",
    });
  }

  if (updates.stock !== undefined && !isValidStock(updates.stock)) {
    return fail({
      kind: "product",
      code: "invalid-input",
      message: "Stock must be zero or greater.",
      field: "stock",
    });
  }

  const updatedProduct: Product = {
    ...currentProduct,
    ...updates,
    name: updates.name ? updates.name.trim() : currentProduct.name,
  };

  const savedProduct = productStore.update(productId, updatedProduct);

  if (!savedProduct) {
    return fail({
      kind: "storage",
      code: "save-failed",
      message: `Could not update product ${productId}.`,
    });
  }

  return ok(savedProduct);
}

export function listProducts(): Product[] {
  return productStore.list();
}

export function getProductById(productId: string): Result<Product, ProductError | StorageError> {
  const product = productStore.getById(productId);

  if (!product) {
    return fail({
      kind: "product",
      code: "not-found",
      message: `Product ${productId} was not found.`,
      productId,
    });
  }

  return ok(product);
}

export function deleteProduct(productId: string): Result<Product, ProductError | StorageError> {
  const product = productStore.getById(productId);

  if (!product) {
    return fail({
      kind: "product",
      code: "not-found",
      message: `Product ${productId} was not found.`,
      productId,
    });
  }

  const deletedProduct = productStore.delete(productId);

  if (!deletedProduct) {
    return fail({
      kind: "storage",
      code: "save-failed",
      message: `Could not delete product ${productId}.`,
    });
  }

  return ok(deletedProduct);
}

export function getStockLevels(): StockLevels {
  const stockLevels: StockLevels = {};

  for (const product of productStore.list()) {
    stockLevels[product.id] = product.stock;
  }

  return stockLevels;
}

export function getLowStockItems(threshold: number): LowStockItem[] {
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

export const productService = {
  createProduct,
  updateProduct,
  listProducts,
  getProductById,
  deleteProduct,
  getStockLevels,
  getLowStockItems,
};
