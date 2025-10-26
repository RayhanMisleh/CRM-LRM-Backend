import BaseService from './baseService';
import invoiceRepository from '../repositories/invoiceRepository';
import { ConflictError, ValidationError } from '../utils/httpErrors';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';

class InvoiceService extends BaseService<typeof invoiceRepository, unknown> {
  private readonly sortableFields = new Set([
    'number',
    'amount',
    'status',
    'issuedAt',
    'dueDate',
    'createdAt',
    'updatedAt',
  ]);

  constructor() {
    super(invoiceRepository);
  }

  async listInvoices(query: Record<string, unknown>) {
    const pagination = parsePagination(query.page as string | undefined, query.pageSize as string | undefined);
    const { sortBy, sortOrder } = parseSort(query.sortBy as string | undefined, query.sortOrder as string | undefined);
    const { startDate, endDate } = parseDateFilters(query.startDate as string | undefined, query.endDate as string | undefined);

    const where: Record<string, unknown> = {};

    const status = query.status as string | undefined;
    if (status) {
      where.status = status;
    }

    const subscriptionId = query.subscriptionId as string | undefined;
    if (subscriptionId) {
      where.subscriptionId = subscriptionId;
    }

    const search = query.search as string | undefined;
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { subscription: { client: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    if (startDate || endDate) {
      where.issuedAt = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const orderBy = sortBy && this.sortableFields.has(sortBy)
      ? { [sortBy]: sortOrder }
      : { issuedAt: 'desc' };

    return this.list({ pagination, where, orderBy });
  }

  async createInvoice(data: Record<string, unknown>) {
    if (!data.subscriptionId) {
      throw new ValidationError('Assinatura é obrigatória');
    }

    if (data.amount === undefined || data.amount === null || (typeof data.amount !== 'number' && typeof data.amount !== 'string')) {
      throw new ValidationError('Valor é obrigatório');
    }

    if (data.number) {
      const existing = await invoiceRepository.list({ where: { number: data.number } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe uma fatura com este número');
      }
    }

    return this.repository.create(data);
  }

  async updateInvoice(id: string, data: Record<string, unknown>) {
    if (data.number) {
      const existing = await invoiceRepository.list({ where: { number: data.number, id: { not: id } } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe uma fatura com este número');
      }
    }

    return this.repository.update(id, data);
  }
}

export default new InvoiceService();
