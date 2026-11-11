export interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  increment(key: string): Promise<number>;
  delete(key: string): Promise<void>;
}

export type CacheRead<T> =
  | { kind: "hit"; value: T }
  | { kind: "miss" }
  | { kind: "unavailable" };

export type CacheLogger = (message: string, error?: unknown) => void;

const defaultLogger: CacheLogger = (message, error) => {
  console.error(message, error);
};

export class CacheService {
  constructor(
    private readonly store: CacheStore | null,
    private readonly logger: CacheLogger = defaultLogger,
  ) {}

  async get<T>(
    key: string,
    decode: (value: unknown) => T | null,
  ): Promise<CacheRead<T>> {
    if (!this.store) {
      return { kind: "unavailable" };
    }

    let serialized: string | null;

    try {
      serialized = await this.store.get(key);
    } catch (error) {
      this.logger(`Redis cache read failed for key "${key}".`, error);
      return { kind: "unavailable" };
    }

    if (serialized === null) {
      return { kind: "miss" };
    }

    let value: unknown;

    try {
      value = JSON.parse(serialized) as unknown;
    } catch (error) {
      this.logger(`Redis cache value is invalid JSON for key "${key}".`, error);
      return { kind: "miss" };
    }

    const decoded = decode(value);

    if (decoded === null) {
      this.logger(`Redis cache value failed validation for key "${key}".`);
      return { kind: "miss" };
    }

    return { kind: "hit", value: decoded };
  }

  async set(
    key: string,
    value: unknown,
    ttlSeconds: number,
  ): Promise<boolean> {
    if (!this.store) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);

      if (serialized === undefined) {
        this.logger(`Redis cache value could not be serialized for key "${key}".`);
        return false;
      }

      await this.store.set(key, serialized, ttlSeconds);
      return true;
    } catch (error) {
      this.logger(`Redis cache write failed for key "${key}".`, error);
      return false;
    }
  }

  async increment(key: string): Promise<number | null> {
    if (!this.store) {
      return null;
    }

    try {
      return await this.store.increment(key);
    } catch (error) {
      this.logger(`Redis cache invalidation failed for namespace "${key}".`, error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.store) {
      return;
    }

    try {
      await this.store.delete(key);
    } catch (error) {
      this.logger(`Redis cache deletion failed for key "${key}".`, error);
    }
  }
}
