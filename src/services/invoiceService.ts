import BaseService from './baseService';
import invoiceRepository from '../repositories/invoiceRepository';
import { ConflictError } from '../lib/http';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';
import {
  CreateInvoiceInput,
  ListInvoicesQuery,
  UpdateInvoiceInput,
} from '../validators/invoice';

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

  async listInvoices(query: ListInvoicesQuery) {
    const pagination = parsePagination(query.page, query.pageSize);
    const { sortBy, sortOrder } = parseSort(query.sortBy, query.sortOrder);
    const { startDate, endDate } = parseDateFilters(query.startDate, query.endDate);

    const where: Record<string, unknown> = {};

    const status = query.status;
    if (status) {
      where.status = status;
    }

    const subscriptionId = query.subscriptionId;
    if (subscriptionId) {
      where.subscriptionId = subscriptionId;
    }

    const search = query.search;
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

  async createInvoice(data: CreateInvoiceInput) {
    if (data.number) {
      const existing = await invoiceRepository.list({ where: { number: data.number } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe uma fatura com este número');
      }
    }

    return this.repository.create(data);
  }

  async updateInvoice(id: string, data: UpdateInvoiceInput) {
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
