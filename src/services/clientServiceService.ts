import BaseService from './baseService';
import clientServiceRepository from '../repositories/clientServiceRepository';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';
import {
  CreateClientServiceInput,
  ListClientServicesQuery,
  UpdateClientServiceInput,
} from '../validators/clientService';

class ClientServiceService extends BaseService<typeof clientServiceRepository, unknown> {
  private readonly sortableFields = new Set([
    'title',
    'status',
    'startDate',
    'goLiveDate',
    'createdAt',
    'updatedAt',
  ]);

  constructor() {
    super(clientServiceRepository);
  }

  async listClientServices(query: ListClientServicesQuery) {
    const pagination = parsePagination(query.page, query.pageSize);
    const { sortBy, sortOrder } = parseSort(query.sortBy, query.sortOrder);
    const { startDate, endDate } = parseDateFilters(query.startDate, query.endDate);

    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.clientId) {
      where.clientId = query.clientId;
    }

    if (query.templateId) {
      where.templateId = query.templateId;
    }

    if (query.contractId) {
      where.contractId = query.contractId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { scope: { contains: query.search, mode: 'insensitive' } },
        { client: { name: { contains: query.search, mode: 'insensitive' } } },
        { template: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (startDate || endDate) {
      where.startDate = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const orderBy =
      sortBy && this.sortableFields.has(sortBy) ? { [sortBy]: sortOrder } : { createdAt: 'desc' };

    return this.list({ pagination, where, orderBy });
  }

  async createClientService(data: CreateClientServiceInput) {
    return this.repository.create(data);
  }

  async updateClientService(id: string, data: UpdateClientServiceInput) {
    return this.repository.update(id, data);
  }
}

export default new ClientServiceService();
