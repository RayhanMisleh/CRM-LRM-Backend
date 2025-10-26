import BaseService from './baseService';
import contractRepository from '../repositories/contractRepository';
import { ConflictError, ValidationError } from '../utils/httpErrors';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';

class ContractService extends BaseService<typeof contractRepository, unknown> {
  private readonly sortableFields = new Set([
    'title',
    'reference',
    'status',
    'createdAt',
    'updatedAt',
    'amount',
    'startDate',
    'endDate',
  ]);

  constructor() {
    super(contractRepository);
  }

  async listContracts(query: Record<string, unknown>) {
    const pagination = parsePagination(query.page as string | undefined, query.pageSize as string | undefined);
    const { sortBy, sortOrder } = parseSort(query.sortBy as string | undefined, query.sortOrder as string | undefined);
    const { startDate, endDate } = parseDateFilters(query.startDate as string | undefined, query.endDate as string | undefined);

    const where: Record<string, unknown> = {};

    const status = query.status as string | undefined;
    if (status) {
      where.status = status;
    }

    const clientId = query.clientId as string | undefined;
    if (clientId) {
      where.clientId = clientId;
    }

    const search = query.search as string | undefined;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.startDate = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const orderBy = sortBy && this.sortableFields.has(sortBy)
      ? { [sortBy]: sortOrder }
      : { createdAt: 'desc' };

    return this.list({ pagination, where, orderBy });
  }

  async createContract(data: Record<string, unknown>) {
    if (!data.title) {
      throw new ValidationError('Título é obrigatório');
    }

    if (!data.clientId) {
      throw new ValidationError('Cliente é obrigatório');
    }

    if (data.reference) {
      const existing = await contractRepository.list({ where: { reference: data.reference } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe um contrato com este número');
      }
    }

    return this.repository.create(data);
  }

  async updateContract(id: string, data: Record<string, unknown>) {
    if (data.reference) {
      const existing = await contractRepository.list({ where: { reference: data.reference, id: { not: id } } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe um contrato com este número');
      }
    }

    return this.repository.update(id, data);
  }
}

export default new ContractService();
