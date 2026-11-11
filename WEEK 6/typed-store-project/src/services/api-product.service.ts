import type { Product } from "@prisma/client";
import { z } from "zod";
import { CacheService } from "../cache/cache.service";
import { cacheService } from "../cache";
import {
  PrismaProductRepository,
  type ProductCreateData,
  type ProductRepository,
  type ProductUpdateData,
} from "../repositories/product.repository";
import { ApiError } from "../utils/api-error";

const productListNamespaceKey = "products:list:v1:namespace";
const productListCachePrefix = "products:list:v1:sort=createdAt-desc";
const productListTtlSeconds = 60;

const cachedProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["electronics", "books", "clothing", "home"]),
  price: z.number(),
  stock: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const cachedProductListSchema = z.array(cachedProductSchema);

function decodeProductList(value: unknown): Product[] | null {
  const parsed = cachedProductListSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export class ApiProductService {
  constructor(
    private readonly repository: ProductRepository,
    private readonly cache: CacheService,
  ) {}

  async listProducts(): Promise<Product[]> {
    const namespace = await this.cache.get(
      productListNamespaceKey,
      (value) =>
        typeof value === "number" && Number.isSafeInteger(value)
          ? value
          : null,
    );

    if (namespace.kind === "unavailable") {
      return this.repository.listProducts();
    }

    const generation =
      namespace.kind === "hit" ? namespace.value : 0;
    const cacheKey =
      `${productListCachePrefix}:generation=${generation}`;
    const cachedProducts = await this.cache.get(
      cacheKey,
      decodeProductList,
    );

    if (cachedProducts.kind === "hit") {
      return cachedProducts.value;
    }

    const products = await this.repository.listProducts();

    if (cachedProducts.kind === "miss") {
      await this.cache.set(cacheKey, products, productListTtlSeconds);
    }

    return products;
  }

  async getProductById(productId: string): Promise<Product> {
    const product = await this.repository.findProductById(productId);

    if (!product) {
      throw new ApiError(404, "Product not found.");
    }

    return product;
  }

  async createProduct(data: ProductCreateData): Promise<Product> {
    const product = await this.repository.createProduct(data);
    await this.invalidateProductListCache();
    return product;
  }

  async updateProduct(
    productId: string,
    data: ProductUpdateData,
  ): Promise<Product> {
    const existing = await this.repository.findProductById(productId);

    if (!existing) {
      throw new ApiError(404, "Product not found.");
    }

    const product = await this.repository.updateProduct(productId, data);
    await this.invalidateProductListCache();
    return product;
  }

  async deleteProduct(productId: string): Promise<Product> {
    const existing = await this.repository.findProductById(productId);

    if (!existing) {
      throw new ApiError(404, "Product not found.");
    }

    const product = await this.repository.deleteProduct(productId);
    await this.invalidateProductListCache();
    return product;
  }

  async invalidateProductListCache(): Promise<void> {
    await this.cache.increment(productListNamespaceKey);
  }
}

export const apiProductService = new ApiProductService(
  new PrismaProductRepository(),
  cacheService,
);
