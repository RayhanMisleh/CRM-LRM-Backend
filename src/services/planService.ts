import BaseService from './baseService';
import planRepository from '../repositories/planRepository';
import { ConflictError } from '../lib/http';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';
import { CreatePlanInput, ListPlansQuery, UpdatePlanInput } from '../validators/plan';

class PlanService extends BaseService<typeof planRepository, unknown> {
  private readonly sortableFields = new Set(['name', 'price', 'billingCycle', 'createdAt', 'updatedAt']);

  constructor() {
    super(planRepository);
  }

  async listPlans(query: ListPlansQuery) {
    const pagination = parsePagination(query.page, query.pageSize);
    const { sortBy, sortOrder } = parseSort(query.sortBy, query.sortOrder);
    const { startDate, endDate } = parseDateFilters(query.startDate, query.endDate);

    const where: Record<string, unknown> = {};

    const search = query.search;
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

  async createPlan(data: CreatePlanInput) {
    const existing = await planRepository.list({ where: { name: data.name } });
    if (existing.length > 0) {
      throw new ConflictError('Já existe um plano com este nome');
    }

    return this.repository.create(data);
  }

  async updatePlan(id: string, data: UpdatePlanInput) {
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
