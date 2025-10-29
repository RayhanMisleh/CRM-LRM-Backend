import BaseService from './baseService';
import serviceBillingRepository from '../repositories/serviceBillingRepository';
import { ConflictError } from '../lib/http';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';
import {
  CreateServiceBillingInput,
  ListServiceBillingsQuery,
  UpdateServiceBillingInput,
} from '../validators/serviceBilling';

class ServiceBillingService extends BaseService<typeof serviceBillingRepository, unknown> {
  private readonly sortableFields = new Set([
    'status',
    'startDate',
    'endDate',
    'createdAt',
    'updatedAt',
  ]);

  constructor() {
    super(serviceBillingRepository);
  }

  async listServiceBillings(query: ListServiceBillingsQuery) {
    const pagination = parsePagination(query.page, query.pageSize);
    const { sortBy, sortOrder } = parseSort(query.sortBy, query.sortOrder);
    const { startDate, endDate } = parseDateFilters(query.startDate, query.endDate);

    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.clientServiceId) {
      where.clientServiceId = query.clientServiceId;
    }

    if (query.search) {
      where.OR = [
        { clientService: { title: { contains: query.search, mode: 'insensitive' } } },
        { clientService: { client: { name: { contains: query.search, mode: 'insensitive' } } } },
      ];
    }

    if (startDate || endDate) {
      where.startDate = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const orderBy =
      sortBy && this.sortableFields.has(sortBy) ? { [sortBy]: sortOrder } : { startDate: 'desc' };

    return this.list({ pagination, where, orderBy });
  }

  async createServiceBilling(data: CreateServiceBillingInput) {
    const activeBillings = await serviceBillingRepository.list({
      where: {
        clientServiceId: data.clientServiceId,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
    });

    if (activeBillings.length > 0) {
      throw new ConflictError(
        'Já existe uma cobrança ativa ou pendente para este serviço do cliente',
      );
    }

    return this.repository.create(data);
  }

  async updateServiceBilling(id: string, data: UpdateServiceBillingInput) {
    return this.repository.update(id, data);
  }
}

export default new ServiceBillingService();
