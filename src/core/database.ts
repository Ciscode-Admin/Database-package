// src/core/database.ts

import {
  DatabaseConfig,
  MongoDatabaseConfig,
  PostgresDatabaseConfig,
  MongoRepositoryOptions,
  PostgresEntityConfig,
  Repository,
} from './contracts';
import { MongoAdapter } from './adapters/mongo.adapter';
import { PostgresAdapter } from './adapters/postgres.adapter';

/**
 * Main facade class that users create.
 * It can be configured for either MongoDB or Postgres.
 */
export class Database {
  /** Discriminated union config: 'mongo' | 'postgres' */
  private readonly config: DatabaseConfig;

  private mongoAdapter?: MongoAdapter;
  private postgresAdapter?: PostgresAdapter;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  /**
   * Initialize the underlying driver connection.
   * Must be awaited before using repositories.
   */
  async connect(): Promise<void> {
    switch (this.config.type) {
      case 'mongo': {
        if (!this.mongoAdapter) {
          this.mongoAdapter = new MongoAdapter(
            this.config as MongoDatabaseConfig,
          );
        }
        await this.mongoAdapter.connect();
        break;
      }

      case 'postgres': {
        if (!this.postgresAdapter) {
          this.postgresAdapter = new PostgresAdapter(
            this.config as PostgresDatabaseConfig,
          );
        }
        // Postgres adapter connect is sync (creates Knex instance)
        this.postgresAdapter.connect();
        break;
      }

      default: {
        // This makes TypeScript prove we handled all cases.
        const _never: never = this.config;
        throw new Error(
          `Unsupported database type: ${(this.config as any).type}`,
        );
      }
    }
  }

  /**
   * Create a Mongo repository using a Mongoose model.
   * Throws if the Database was created with type !== 'mongo'.
   */
  createMongoRepository<T = any>(
    options: MongoRepositoryOptions<T>,
  ): Repository<T> {
    if (this.config.type !== 'mongo') {
      throw new Error(
        `Database type is "${this.config.type}". createMongoRepository can only be used when type === "mongo".`,
      );
    }
    if (!this.mongoAdapter) {
      this.mongoAdapter = new MongoAdapter(this.config as MongoDatabaseConfig);
    }
    return this.mongoAdapter.createRepository<T>(options);
  }

  /**
   * Create a Postgres repository using an entity config.
   * Throws if the Database was created with type !== 'postgres'.
   */
  createPostgresRepository<T = any>(
    cfg: PostgresEntityConfig<T>,
  ): Repository<T> {
    if (this.config.type !== 'postgres') {
      throw new Error(
        `Database type is "${this.config.type}". createPostgresRepository can only be used when type === "postgres".`,
      );
    }
    if (!this.postgresAdapter) {
      this.postgresAdapter = new PostgresAdapter(
        this.config as PostgresDatabaseConfig,
      );
      this.postgresAdapter.connect();
    }
    return this.postgresAdapter.createRepository<T>(cfg);
  }
}
