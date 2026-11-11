import assert from "node:assert/strict";
import test from "node:test";
import type { Product } from "@prisma/client";
import {
  CacheService,
  type CacheStore,
} from "../src/cache/cache.service";
import {
  ApiProductService,
} from "../src/services/api-product.service";
import type {
  ProductCreateData,
  ProductRepository,
  ProductUpdateData,
} from "../src/repositories/product.repository";

class MockCacheStore implements CacheStore {
  readonly values = new Map<string, string>();
  readonly ttls = new Map<string, number>();
  incrementCalls = 0;
  failGet = false;
  failSet = false;
  failIncrement = false;

  async get(key: string): Promise<string | null> {
    if (this.failGet) {
      throw new Error("mock Redis read failure");
    }

    return this.values.get(key) ?? null;
  }

  async set(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<void> {
    if (this.failSet) {
      throw new Error("mock Redis write failure");
    }

    this.values.set(key, value);
    this.ttls.set(key, ttlSeconds);
  }

  async increment(key: string): Promise<number> {
    this.incrementCalls += 1;

    if (this.failIncrement) {
      throw new Error("mock Redis invalidation failure");
    }

    const nextValue = Number(this.values.get(key) ?? "0") + 1;
    this.values.set(key, String(nextValue));
    return nextValue;
  }

  async delete(key: string): Promise<void> {
    this.values.delete(key);
    this.ttls.delete(key);
  }
}

class MockProductRepository implements ProductRepository {
  products: Product[];
  listCalls = 0;
  failCreate = false;
  failUpdate = false;
  failDelete = false;

  constructor(products: Product[]) {
    this.products = products;
  }

  async listProducts(): Promise<Product[]> {
    this.listCalls += 1;
    return [...this.products];
  }

  async findProductById(productId: string): Promise<Product | null> {
    return this.products.find((product) => product.id === productId) ?? null;
  }

  async createProduct(data: ProductCreateData): Promise<Product> {
    if (this.failCreate) {
      throw new Error("mock database write failure");
    }

    const product = makeProduct(String(this.products.length + 1), data.name, data);
    this.products.push(product);
    return product;
  }

  async updateProduct(
    productId: string,
    data: ProductUpdateData,
  ): Promise<Product> {
    if (this.failUpdate) {
      throw new Error("mock database update failure");
    }

    const index = this.products.findIndex((product) => product.id === productId);

    if (index < 0) {
      throw new Error("Product not found.");
    }

    const product = { ...this.products[index], ...data, updatedAt: new Date() };
    this.products[index] = product;
    return product;
  }

  async deleteProduct(productId: string): Promise<Product> {
    if (this.failDelete) {
      throw new Error("mock database delete failure");
    }

    const index = this.products.findIndex((product) => product.id === productId);

    if (index < 0) {
      throw new Error("Product not found.");
    }

    const [product] = this.products.splice(index, 1);
    return product;
  }
}

function makeProduct(
  id: string,
  name: string,
  overrides: Partial<ProductCreateData> = {},
): Product {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return {
    id,
    name,
    category: overrides.category ?? "books",
    price: overrides.price ?? 12,
    stock: overrides.stock ?? 5,
    createdAt: now,
    updatedAt: now,
  };
}

function createService(
  repository: MockProductRepository,
  store: MockCacheStore,
  logs: string[] = [],
): ApiProductService {
  const cache = new CacheService(store, (message) => logs.push(message));
  return new ApiProductService(repository, cache);
}

test("product list caches a database miss for 60 seconds and serves a hit", async () => {
  const store = new MockCacheStore();
  const repository = new MockProductRepository([makeProduct("1", "Book")]);
  const service = createService(repository, store);

  const firstResult = await service.listProducts();
  const secondResult = await service.listProducts();

  assert.deepEqual(firstResult, secondResult);
  assert.equal(repository.listCalls, 1);
  assert.equal(store.ttls.get("products:list:v1:sort=createdAt-desc:generation=0"), 60);
});

test("create, update, and delete invalidate list data after successful writes", async () => {
  const store = new MockCacheStore();
  const repository = new MockProductRepository([makeProduct("1", "Book")]);
  const service = createService(repository, store);

  await service.listProducts();
  await service.createProduct({
    name: "Pen",
    category: "books",
    price: 2,
    stock: 10,
  });
  assert.equal((await service.listProducts()).length, 2);

  await service.updateProduct("1", { name: "Updated book" });
  assert.equal((await service.listProducts())[0]?.name, "Updated book");

  await service.deleteProduct("2");
  assert.equal((await service.listProducts()).length, 1);
  assert.equal(store.incrementCalls, 3);
  assert.equal(repository.listCalls, 4);
});

test("failed database writes do not invalidate cached product lists", async () => {
  const store = new MockCacheStore();
  const repository = new MockProductRepository([makeProduct("1", "Book")]);
  const service = createService(repository, store);

  repository.failCreate = true;
  await assert.rejects(
    service.createProduct({
      name: "Pen",
      category: "books",
      price: 2,
      stock: 10,
    }),
    /mock database write failure/,
  );

  repository.failCreate = false;
  repository.failUpdate = true;
  await assert.rejects(
    service.updateProduct("1", { name: "Updated book" }),
    /mock database update failure/,
  );

  repository.failUpdate = false;
  repository.failDelete = true;
  await assert.rejects(
    service.deleteProduct("1"),
    /mock database delete failure/,
  );

  assert.equal(store.incrementCalls, 0);
});

test("Redis read failure falls back to MongoDB and is logged", async () => {
  const store = new MockCacheStore();
  const logs: string[] = [];
  const repository = new MockProductRepository([makeProduct("1", "Book")]);
  const service = createService(repository, store, logs);
  store.failGet = true;

  const products = await service.listProducts();

  assert.equal(products.length, 1);
  assert.equal(repository.listCalls, 1);
  assert.equal(logs.some((message) => message.includes("Redis cache read failed")), true);
});

test("Redis cache write failure returns the database result and is logged", async () => {
  const store = new MockCacheStore();
  const logs: string[] = [];
  const repository = new MockProductRepository([makeProduct("1", "Book")]);
  const service = createService(repository, store, logs);
  store.failSet = true;

  const products = await service.listProducts();

  assert.equal(products.length, 1);
  assert.equal(repository.listCalls, 1);
  assert.equal(logs.some((message) => message.includes("Redis cache write failed")), true);
});

test("Redis invalidation failure does not turn a successful write into failure", async () => {
  const store = new MockCacheStore();
  const logs: string[] = [];
  const repository = new MockProductRepository([]);
  const service = createService(repository, store, logs);
  store.failIncrement = true;

  const product = await service.createProduct({
    name: "Pen",
    category: "books",
    price: 2,
    stock: 10,
  });

  assert.equal(product.name, "Pen");
  assert.equal(repository.products.length, 1);
  assert.equal(
    logs.some((message) => message.includes("Redis cache invalidation failed")),
    true,
  );
});
