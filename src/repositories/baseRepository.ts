import prisma from '../config/prisma';

type PrismaModel = keyof typeof prisma;

export interface ListParams {
  skip?: number;
  take?: number;
  where?: Record<string, unknown>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
}

export default class BaseRepository<TModelName extends PrismaModel> {
  protected readonly model;

  constructor(modelName: TModelName) {
    const prismaModel = (prisma as any)[modelName];

    if (!prismaModel) {
      throw new Error(`Model ${String(modelName)} not found in Prisma client`);
    }

    this.model = prismaModel;
  }

  async list(params: ListParams) {
    return this.model.findMany(params);
  }

  async count(where?: Record<string, unknown>) {
    return this.model.count({ where });
  }

  async findById(id: string) {
    return this.model.findUnique({ where: { id } });
  }

  async create<TData>(data: TData) {
    return this.model.create({ data });
  }

  async update<TData>(id: string, data: TData) {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.model.delete({ where: { id } });
  }
}
