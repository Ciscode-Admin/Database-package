// src/core/adapters/mongo.adapter.ts
import mongoose, { ConnectOptions, Model } from 'mongoose';
import {
  MongoDatabaseConfig,
  MongoRepositoryOptions,
  Repository,
} from '../contracts';

export class MongoAdapter {
  private readonly config: MongoDatabaseConfig;
  private connectionPromise?: Promise<typeof mongoose>;

  constructor(config: MongoDatabaseConfig) {
    this.config = config;
    mongoose.set('strictQuery', false);
  }

  async connect(options: ConnectOptions = {}): Promise<typeof mongoose> {
    if (!this.connectionPromise) {
      this.connectionPromise = mongoose.connect(this.config.connectionString, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        ...options,
      });
      mongoose.connection.on('error', (err) => {
        // Important: never process.exit() inside a library
        console.error('[database-lib] Mongo error:', err?.message || err);
      });
    }
    return this.connectionPromise;
  }

  createRepository<T = any>(opts: MongoRepositoryOptions<T>): Repository<T> {
    const model: Model<T> = opts.model;

    const shapePage = (data: T[], page: number, limit: number, total: number) => {
      const pages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));
      return { data, page, limit, total, pages };
    };

    const repo: Repository<T> = {
      async create(data: Partial<T>): Promise<T> {
        const doc = await model.create(data);
        return (doc as any).toObject?.() ?? (doc as any);
      },

      async findById(id: string): Promise<T | null> {
        const doc = await model.findById(id).lean().exec();
        return doc as any;
      },

      async findAll(filter: Record<string, any> = {}): Promise<T[]> {
        const docs = await model.find(filter).lean().exec();
        return docs as any;
      },

      async findPage(options = {}): Promise<{
        data: T[];
        page: number;
        limit: number;
        total: number;
        pages: number;
      }> {
        const {
          filter = {},
          page = 1,
          limit = 10,
          sort,
        } = options;

        const skip = Math.max(0, (page - 1) * limit);
        let query = model.find(filter).skip(skip).limit(limit);

        if (sort) {
          query = query.sort(sort as any);
        }

        const [data, total] = await Promise.all([
          query.lean().exec(),
          model.countDocuments(filter).exec(),
        ]);

        return shapePage(data as any, page, limit, total);
      },

      async updateById(id: string, update: Partial<T>): Promise<T | null> {
        const doc = await model
          .findByIdAndUpdate(id, update, { new: true })
          .lean()
          .exec();
        return doc as any;
      },

      async deleteById(id: string): Promise<boolean> {
        const res = await model.findByIdAndDelete(id).lean().exec();
        return !!res;
      },

      async count(filter: Record<string, any> = {}): Promise<number> {
        const total = await model.countDocuments(filter).exec();
        return total;
      },

      async exists(filter: Record<string, any> = {}): Promise<boolean> {
        const res = await model.exists(filter).lean();
        return !!res;
      },
    };

    return repo;
  }
}
