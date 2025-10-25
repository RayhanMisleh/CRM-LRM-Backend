import BaseService from './baseService';
import domainRepository from '../repositories/domainRepository';
import { ConflictError, ValidationError } from '../utils/httpErrors';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';

class DomainService extends BaseService<typeof domainRepository, unknown> {
  private readonly sortableFields = new Set(['nome', 'dominio', 'createdAt']);

  constructor() {
    super(domainRepository);
  }

  async listDomains(query: Record<string, unknown>) {
    const pagination = parsePagination(query.page as string | undefined, query.pageSize as string | undefined);
    const { sortBy, sortOrder } = parseSort(query.sortBy as string | undefined, query.sortOrder as string | undefined);
    const { startDate, endDate } = parseDateFilters(query.startDate as string | undefined, query.endDate as string | undefined);

    const where: Record<string, unknown> = {};

    const search = query.search as string | undefined;
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { dominio: { contains: search, mode: 'insensitive' } },
      ];
    }

    const clientId = query.clientId as string | undefined;
    if (clientId) {
      where.clienteId = clientId;
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

  async createDomain(data: Record<string, unknown>) {
    if (!data.nome) {
      throw new ValidationError('Nome é obrigatório');
    }

    if (!data.dominio) {
      throw new ValidationError('Domínio é obrigatório');
    }

    const existing = await domainRepository.list({ where: { nome: data.nome } });
    if (existing.length > 0) {
      throw new ConflictError('Já existe um domínio com este nome');
    }

    return this.repository.create(data);
  }

  async updateDomain(id: string, data: Record<string, unknown>) {
    if (data.nome) {
      const existing = await domainRepository.list({ where: { nome: data.nome, id: { not: id } } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe um domínio com este nome');
      }
    }

    return this.repository.update(id, data);
  }
}

export default new DomainService();
