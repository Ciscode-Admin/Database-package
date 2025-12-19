// src/nest/database.module.ts
import { DynamicModule, Global, Module } from '@nestjs/common';
import { Database } from '../core/database';
import { DatabaseConfig } from '../core/contracts';

export const DATABASE_TOKEN = 'DATABASE_DEFAULT';

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(config: DatabaseConfig): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DATABASE_TOKEN,
          useFactory: async () => {
            const db = new Database(config);
            await db.connect();
            return db;
          },
        },
      ],
      exports: [DATABASE_TOKEN],
    };
  }
}
