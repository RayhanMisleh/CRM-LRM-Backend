import BaseService from './baseService';
import serviceTemplateRepository from '../repositories/serviceTemplateRepository';
import { ConflictError } from '../lib/http';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';
import {
  CreateServiceTemplateInput,
  ListServiceTemplatesQuery,
  UpdateServiceTemplateInput,
} from '../validators/serviceTemplate';

class ServiceTemplateService extends BaseService<typeof serviceTemplateRepository, unknown> {
  private readonly sortableFields = new Set([
    'name',
    'baseMonthlyFee',
    'defaultBillingCycle',
    'createdAt',
    'updatedAt',
  ]);

  constructor() {
    super(serviceTemplateRepository);
  }

  async listServiceTemplates(query: ListServiceTemplatesQuery) {
    const pagination = parsePagination(query.page, query.pageSize);
    const { sortBy, sortOrder } = parseSort(query.sortBy, query.sortOrder);
    const { startDate, endDate } = parseDateFilters(query.startDate, query.endDate);

    const where: Record<string, unknown> = {};

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const orderBy =
      sortBy && this.sortableFields.has(sortBy) ? { [sortBy]: sortOrder } : { createdAt: 'desc' };

    return this.list({ pagination, where, orderBy });
  }

  async createServiceTemplate(data: CreateServiceTemplateInput) {
    const existing = await serviceTemplateRepository.list({ where: { name: data.name } });
    if (existing.length > 0) {
      throw new ConflictError('Já existe um serviço de catálogo com este nome');
    }

    return this.repository.create(data);
  }

  async updateServiceTemplate(id: string, data: UpdateServiceTemplateInput) {
    if (data.name) {
      const existing = await serviceTemplateRepository.list({
        where: { name: data.name, id: { not: id } },
      });

      if (existing.length > 0) {
        throw new ConflictError('Já existe um serviço de catálogo com este nome');
      }
    }

    return this.repository.update(id, data);
  }
}

export default new ServiceTemplateService();
