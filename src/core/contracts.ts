// src/core/contracts.ts

// -----------------------------
// Basic database config types
// -----------------------------

export type DatabaseType = 'mongo' | 'postgres';

export interface DatabaseConfigBase {
  /** Which adapter to use */
  type: DatabaseType;
  /** Connection string for the DB */
  connectionString: string;
}

export interface MongoDatabaseConfig extends DatabaseConfigBase {
  type: 'mongo';
}

export interface PostgresDatabaseConfig extends DatabaseConfigBase {
  type: 'postgres';
}

/**
 * Discriminated union used by Database.
 * This is important so `config.type` narrows to 'mongo' | 'postgres'.
 */
export type DatabaseConfig = MongoDatabaseConfig | PostgresDatabaseConfig;

// -----------------------------
// Repository interfaces
// -----------------------------

export interface PageResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PageOptions<Filter = Record<string, any>> {
  filter?: Filter;
  page?: number;
  limit?: number;
  sort?: string | Record<string, 1 | -1 | 'asc' | 'desc'>;
}

/**
 * Generic repository interface used by both Mongo and Postgres.
 */
export interface Repository<T = any, Filter = Record<string, any>> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string | number): Promise<T | null>;
  findAll(filter?: Filter): Promise<T[]>;
  findPage(options?: PageOptions<Filter>): Promise<PageResult<T>>;
  updateById(id: string | number, update: Partial<T>): Promise<T | null>;
  deleteById(id: string | number): Promise<boolean>;
  count(filter?: Filter): Promise<number>;
  exists(filter?: Filter): Promise<boolean>;
}

// -----------------------------
// Repo creation options
// -----------------------------

/**
 * Options when creating a Mongo repository.
 * `model` is intentionally typed as `any` so JS consumers can use it
 * without importing Mongoose types.
 */
export interface MongoRepositoryOptions<T = any> {
  model: any; // Mongoose Model<T>
}

/**
 * Options when creating a Postgres repository.
 * The library stays schema-agnostic; the consumer provides table info.
 */
export interface PostgresEntityConfig<T = any> {
  /** Table name in Postgres */
  table: string;
  /** Primary key column (default: "id") */
  primaryKey?: string;
  /**
   * Whitelist of allowed columns for select/filter/sort.
   * If empty, all columns are allowed (not recommended for public APIs).
   */
  columns?: string[];
  /**
   * Base filter automatically applied on every query.
   * Example: { is_deleted: false }
   */
  defaultFilter?: Record<string, any>;
}
