import { CacheService } from "./cache.service";
import { RedisCacheStore } from "./redis-cache-store";

const redisUrl = process.env["REDIS_URL"];

if (!redisUrl) {
  console.error(
    "Redis cache is disabled because REDIS_URL is not configured; product-list requests will use MongoDB.",
  );
}

export const redisCacheStore = redisUrl
  ? new RedisCacheStore(redisUrl)
  : null;

export const cacheService = new CacheService(redisCacheStore);

export async function connectRedis(): Promise<void> {
  if (!redisCacheStore) {
    return;
  }

  try {
    await redisCacheStore.connect();
    console.log("Redis cache connected.");
  } catch (error) {
    console.error(
      "Redis cache connection failed; product-list requests will use MongoDB until Redis is available.",
      error,
    );
  }
}

export async function closeRedis(): Promise<void> {
  if (!redisCacheStore) {
    return;
  }

  await redisCacheStore.close();
}
