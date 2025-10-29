import BaseService from './baseService';
import domainRepository from '../repositories/domainRepository';
import { ConflictError } from '../lib/http';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';
import { CreateDomainInput, ListDomainsQuery, UpdateDomainInput } from '../validators/domain';

class DomainService extends BaseService<typeof domainRepository, unknown> {
  private readonly sortableFields = new Set(['name', 'hostname', 'expiresAt', 'createdAt']);

  constructor() {
    super(domainRepository);
  }

  async listDomains(query: ListDomainsQuery) {
    const pagination = parsePagination(query.page, query.pageSize);
    const { sortBy, sortOrder } = parseSort(query.sortBy, query.sortOrder);
    const { startDate, endDate } = parseDateFilters(query.startDate, query.endDate);

    const where: Record<string, unknown> = {};

    const search = query.search;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { hostname: { contains: search, mode: 'insensitive' } },
      ];
    }

    const clientId = query.clientId;
    if (clientId) {
      where.clientId = clientId;
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

  async createDomain(data: CreateDomainInput) {
    const existing = await domainRepository.list({ where: { hostname: data.hostname } });
    if (existing.length > 0) {
      throw new ConflictError('Já existe um domínio com este hostname');
    }

    return this.repository.create(data);
  }

  async updateDomain(id: string, data: UpdateDomainInput) {
    if (data.hostname) {
      const existing = await domainRepository.list({
        where: { hostname: data.hostname, id: { not: id } },
      });
      if (existing.length > 0) {
        throw new ConflictError('Já existe um domínio com este hostname');
      }
    }

    return this.repository.update(id, data);
  }
}

export default new DomainService();
