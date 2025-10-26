import BaseService from './baseService';
import clientRepository from '../repositories/clientRepository';
import { ConflictError } from '../lib/http';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';
import {
  CreateClientInput,
  ListClientsQuery,
  UpdateClientInput,
} from '../validators/client';

class ClientService extends BaseService<typeof clientRepository, unknown> {
  private readonly sortableFields = new Set(['name', 'email', 'status', 'createdAt', 'updatedAt']);

  constructor() {
    super(clientRepository);
  }

  async listClients(query: ListClientsQuery) {
    const pagination = parsePagination(query.page, query.pageSize);
    const { sortBy, sortOrder } = parseSort(query.sortBy, query.sortOrder);
    const { startDate, endDate } = parseDateFilters(query.startDate, query.endDate);

    const where: Record<string, unknown> = {};

    const search = query.search;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const status = query.status;
    if (status) {
      where.status = status;
    }

    const companyId = query.companyId;
    if (companyId) {
      where.empresaId = companyId;
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

  async createClient(data: CreateClientInput) {
    if (data.email) {
      const existing = await clientRepository.list({ where: { email: data.email } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe um cliente com este email');
      }
    }

    return this.repository.create(data);
  }

  async updateClient(id: string, data: UpdateClientInput) {
    if (data.email) {
      const existing = await clientRepository.list({ where: { email: data.email, id: { not: id } } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe um cliente com este email');
      }
    }

    return this.repository.update(id, data);
  }
}

export default new ClientService();
