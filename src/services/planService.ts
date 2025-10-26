import BaseService from './baseService';
import planRepository from '../repositories/planRepository';
import { ConflictError, ValidationError } from '../utils/httpErrors';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';

class PlanService extends BaseService<typeof planRepository, unknown> {
  private readonly sortableFields = new Set(['name', 'price', 'billingCycle', 'createdAt', 'updatedAt']);

  constructor() {
    super(planRepository);
  }

  async listPlans(query: Record<string, unknown>) {
    const pagination = parsePagination(query.page as string | undefined, query.pageSize as string | undefined);
    const { sortBy, sortOrder } = parseSort(query.sortBy as string | undefined, query.sortOrder as string | undefined);
    const { startDate, endDate } = parseDateFilters(query.startDate as string | undefined, query.endDate as string | undefined);

    const where: Record<string, unknown> = {};

    const search = query.search as string | undefined;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const orderBy = sortBy && this.sortableFields.has(sortBy)
      ? { [sortBy]: sortOrder }
      : { createdAt: 'desc' };

    return this.list({ pagination, where, orderBy });
  }

  async createPlan(data: Record<string, unknown>) {
    if (!data.name) {
      throw new ValidationError('Nome é obrigatório');
    }

    if (data.price === undefined || data.price === null || (typeof data.price !== 'number' && typeof data.price !== 'string')) {
      throw new ValidationError('Preço é obrigatório');
    }

    const existing = await planRepository.list({ where: { name: data.name } });
    if (existing.length > 0) {
      throw new ConflictError('Já existe um plano com este nome');
    }

    return this.repository.create(data);
  }

  async updatePlan(id: string, data: Record<string, unknown>) {
    if (data.name) {
      const existing = await planRepository.list({ where: { name: data.name, id: { not: id } } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe um plano com este nome');
      }
    }

    return this.repository.update(id, data);
  }
}

export default new PlanService();
