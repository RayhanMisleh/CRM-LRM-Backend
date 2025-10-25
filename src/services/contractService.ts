import BaseService from './baseService';
import contractRepository from '../repositories/contractRepository';
import { ConflictError, ValidationError } from '../utils/httpErrors';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';

class ContractService extends BaseService<typeof contractRepository, unknown> {
  private readonly sortableFields = new Set(['titulo', 'numero', 'status', 'createdAt', 'updatedAt', 'valor']);

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

    const clienteId = query.clientId as string | undefined;
    if (clienteId) {
      where.clienteId = clienteId;
    }

    const search = query.search as string | undefined;
    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { numero: { contains: search, mode: 'insensitive' } },
      ];
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

  async createContract(data: Record<string, unknown>) {
    if (!data.titulo) {
      throw new ValidationError('Título é obrigatório');
    }

    if (!data.clienteId) {
      throw new ValidationError('Cliente é obrigatório');
    }

    if (!data.userId) {
      throw new ValidationError('Usuário responsável é obrigatório');
    }

    if (data.numero) {
      const existing = await contractRepository.list({ where: { numero: data.numero } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe um contrato com este número');
      }
    }

    return this.repository.create(data);
  }

  async updateContract(id: string, data: Record<string, unknown>) {
    if (data.numero) {
      const existing = await contractRepository.list({ where: { numero: data.numero, id: { not: id } } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe um contrato com este número');
      }
    }

    return this.repository.update(id, data);
  }
}

export default new ContractService();
