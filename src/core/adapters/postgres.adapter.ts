// src/core/adapters/postgres.adapter.ts
import knex, { Knex } from 'knex';
import {
  PostgresDatabaseConfig,
  PostgresEntityConfig,
  Repository,
} from '../contracts';

export class PostgresAdapter {
  private readonly config: PostgresDatabaseConfig;
  private knexInstance?: Knex;

  constructor(config: PostgresDatabaseConfig) {
    this.config = config;
  }

  connect(overrides: Knex.Config = {}): Knex {
    if (!this.knexInstance) {
      this.knexInstance = knex({
        client: 'pg',
        connection: this.config.connectionString,
        pool: { min: 0, max: 10 },
        ...overrides,
      });
    }
    return this.knexInstance;
  }

  getKnex(): Knex {
    if (!this.knexInstance) {
      throw new Error('Postgres not connected. Call connect() first.');
    }
    return this.knexInstance;
  }

  createRepository<T = any>(cfg: PostgresEntityConfig<T>): Repository<T> {
    const kx = this.getKnex();
    const table = cfg.table;
    const pk = cfg.primaryKey || 'id';
    const allowed = cfg.columns || [];
    const baseFilter = cfg.defaultFilter || {};

    const assertFieldAllowed = (field: string) => {
      if (allowed.length && !allowed.includes(field)) {
        throw new Error(
          `Field "${field}" is not allowed for table "${table}". Add it to columns[] in config.`,
        );
      }
    };

    const applyFilter = (qb: Knex.QueryBuilder, filter: Record<string, any>) => {
      Object.entries(filter).forEach(([key, value]) => {
        assertFieldAllowed(key);
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const ops: any = value;
          if (ops.eq !== undefined) qb.where(key, ops.eq);
          if (ops.ne !== undefined) qb.whereNot(key, ops.ne);
          if (ops.gt !== undefined) qb.where(key, '>', ops.gt);
          if (ops.gte !== undefined) qb.where(key, '>=', ops.gte);
          if (ops.lt !== undefined) qb.where(key, '<', ops.lt);
          if (ops.lte !== undefined) qb.where(key, '<=', ops.lte);
          if (ops.in) qb.whereIn(key, ops.in);
          if (ops.nin) qb.whereNotIn(key, ops.nin);
          if (ops.like) qb.whereILike(key, ops.like);
          if (ops.isNull === true) qb.whereNull(key);
          if (ops.isNotNull === true) qb.whereNotNull(key);
        } else {
          qb.where(key, value);
        }
      });
    };

    const applySort = (
      qb: Knex.QueryBuilder,
      sort?: string | Record<string, any>,
    ) => {
      if (!sort) return;

      if (typeof sort === 'string') {
        const parts = sort.split(',');
        for (const p of parts) {
          const dir = p.startsWith('-') ? 'desc' : 'asc';
          const col = p.replace(/^[-+]/, '');
          assertFieldAllowed(col);
          qb.orderBy(col, dir);
        }
      } else {
        Object.entries(sort).forEach(([col, dir]) => {
          assertFieldAllowed(col);
          const direction =
            dir === -1 || String(dir).toLowerCase() === 'desc'
              ? 'desc'
              : 'asc';
          qb.orderBy(col, direction);
        });
      }
    };

    const shapePage = (data: T[], page: number, limit: number, total: number) => {
      const pages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));
      return { data, page, limit, total, pages };
    };

    const repo: Repository<T> = {
      async create(data: Partial<T>): Promise<T> {
        const [row] = await kx(table).insert(data).returning('*');
        return row as T;
      },

      async findById(id: string | number): Promise<T | null> {
        const row = await kx(table)
          .select('*')
          .where({ [pk]: id, ...baseFilter })
          .first();
        return (row as T) || null;
      },

      async findAll(filter: Record<string, any> = {}): Promise<T[]> {
        const mergedFilter = { ...baseFilter, ...filter };
        const qb = kx(table).select('*');
        applyFilter(qb, mergedFilter);
        const rows = await qb;
        return rows as T[];
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
        const mergedFilter = { ...baseFilter, ...filter };

        const offset = Math.max(0, (page - 1) * limit);

        const qb = kx(table).select('*');
        applyFilter(qb, mergedFilter);
        applySort(qb, sort);

        const data = (await qb.clone().limit(limit).offset(offset)) as T[];

        const countRow = await kx(table)
          .count<{ count: string }[]>({ count: '*' })
          .modify((q) => applyFilter(q, mergedFilter));
        const total = Number(countRow[0]?.count || 0);

        return shapePage(data, page, limit, total);
      },

      async updateById(
        id: string | number,
        update: Partial<T>,
      ): Promise<T | null> {
        const [row] = await kx(table)
          .where({ [pk]: id })
          .update(update)
          .returning('*');
        return (row as T) || null;
      },

      async deleteById(id: string | number): Promise<boolean> {
        const [row] = await kx(table)
          .where({ [pk]: id })
          .delete()
          .returning('*');
        return !!row;
      },

      async count(filter: Record<string, any> = {}): Promise<number> {
        const mergedFilter = { ...baseFilter, ...filter };
        const [{ count }] = await kx(table)
          .count<{ count: string }[]>({ count: '*' })
          .modify((q) => applyFilter(q, mergedFilter));
        return Number(count || 0);
      },

      async exists(filter: Record<string, any> = {}): Promise<boolean> {
        const mergedFilter = { ...baseFilter, ...filter };
        const row = await kx(table)
          .select([pk])
          .modify((q) => applyFilter(q, mergedFilter))
          .first();
        return !!row;
      },
    };

    return repo;
  }
}
