import BaseRepository, { ListParams } from '../repositories/baseRepository';
import { NotFoundError, ValidationError } from '../utils/httpErrors';
import { PaginationParams } from '../utils/queryParsers';

export interface ListOptions {
  pagination: PaginationParams;
  where?: Record<string, unknown>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default class BaseService<TRepository extends BaseRepository<any>, TResult> {
  protected readonly repository: TRepository;

  constructor(repository: TRepository) {
    this.repository = repository;
  }

  async list({ pagination, where, orderBy }: ListOptions): Promise<PaginatedResponse<TResult>> {
    const listParams: ListParams = {
      skip: pagination.skip,
      take: pagination.take,
      where,
      orderBy,
    };

    const [data, total] = await Promise.all([
      this.repository.list(listParams),
      this.repository.count(where),
    ]);

    return {
      data,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize) || 1,
    };
  }

  async getById(id: string): Promise<TResult> {
    if (!id) {
      throw new ValidationError('ID é obrigatório');
    }

    const entity = await this.repository.findById(id);

    if (!entity) {
      throw new NotFoundError('Recurso não encontrado');
    }

    return entity;
  }

  async create<TData>(data: TData): Promise<TResult> {
    return this.repository.create(data);
  }

  async update<TData>(id: string, data: TData): Promise<TResult> {
    await this.getById(id);
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repository.delete(id);
  }
}
