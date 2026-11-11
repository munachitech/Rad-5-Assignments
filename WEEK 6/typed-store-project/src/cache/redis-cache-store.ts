import { createClient } from "redis";
import type { CacheStore } from "./cache.service";

export class RedisCacheStore implements CacheStore {
  private readonly client;

  constructor(url: string) {
    this.client = createClient({
      url,
      disableOfflineQueue: true,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 3_000),
      },
    });

    this.client.on("error", (error: unknown) => {
      console.error("Redis client connection error:", error);
    });
  }

  async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async close(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  async get(key: string): Promise<string | null> {
    this.ensureReady();
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.ensureReady();
    await this.client.set(key, value, { EX: ttlSeconds });
  }

  async increment(key: string): Promise<number> {
    this.ensureReady();
    return this.client.incr(key);
  }

  async delete(key: string): Promise<void> {
    this.ensureReady();
    await this.client.del(key);
  }

  private ensureReady(): void {
    if (!this.client.isReady) {
      throw new Error("Redis client is not ready.");
    }
  }
}
