import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { CacheService } from "../src/cache/cache.service";
import { RedisCacheStore } from "../src/cache/redis-cache-store";

const redisUrl = process.env["REDIS_INTEGRATION_URL"];

test(
  "Redis cache supports list values and namespace increments",
  { skip: !redisUrl },
  async () => {
    if (!redisUrl) {
      return;
    }

    const store = new RedisCacheStore(redisUrl);
    const cache = new CacheService(store);
    const testPrefix = `products:list:integration:${randomUUID()}`;
    const listKey = `${testPrefix}:generation=0`;
    const namespaceKey = `${testPrefix}:namespace`;

    await store.connect();

    try {
      const missing = await cache.get(listKey, (value) =>
        Array.isArray(value) ? value : null,
      );
      assert.equal(missing.kind, "miss");

      assert.equal(await cache.set(listKey, [{ id: "test-product" }], 60), true);

      const hit = await cache.get(listKey, (value) =>
        Array.isArray(value) ? value : null,
      );
      assert.equal(hit.kind, "hit");
      assert.deepEqual(hit.kind === "hit" ? hit.value : null, [
        { id: "test-product" },
      ]);

      assert.equal(await cache.increment(namespaceKey), 1);
    } finally {
      await store.delete(listKey);
      await store.delete(namespaceKey);
      await store.close();
    }
  },
);
