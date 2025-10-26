import BaseService from './baseService';
import contractRepository from '../repositories/contractRepository';
import { ConflictError } from '../lib/http';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';
import {
  CreateContractInput,
  ListContractsQuery,
  UpdateContractInput,
} from '../validators/contract';

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

  async listContracts(query: ListContractsQuery) {
    const pagination = parsePagination(query.page, query.pageSize);
    const { sortBy, sortOrder } = parseSort(query.sortBy, query.sortOrder);
    const { startDate, endDate } = parseDateFilters(query.startDate, query.endDate);

    const where: Record<string, unknown> = {};

    const status = query.status;
    if (status) {
      where.status = status;
    }

    const clientId = query.clientId;
    if (clientId) {
      where.clientId = clientId;
    }

    const search = query.search;
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

  async createContract(data: CreateContractInput) {
    if (data.reference) {
      const existing = await contractRepository.list({ where: { reference: data.reference } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe um contrato com este número');
      }
    }

    return this.repository.create(data);
  }

  async updateContract(id: string, data: UpdateContractInput) {
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
