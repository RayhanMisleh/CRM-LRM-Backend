import BaseService from './baseService';
import invoiceRepository from '../repositories/invoiceRepository';
import { ConflictError, ValidationError } from '../utils/httpErrors';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';

class InvoiceService extends BaseService<typeof invoiceRepository, unknown> {
  private readonly sortableFields = new Set([
    'numero',
    'valor',
    'status',
    'dataEmissao',
    'dataVencimento',
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
      where.assinaturaId = subscriptionId;
    }

    const search = query.search as string | undefined;
    if (search) {
      where.OR = [
        { numero: { contains: search, mode: 'insensitive' } },
        { assinatura: { cliente: { nome: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    if (startDate || endDate) {
      where.dataEmissao = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const orderBy = sortBy && this.sortableFields.has(sortBy)
      ? { [sortBy]: sortOrder }
      : { dataEmissao: 'desc' };

    return this.list({ pagination, where, orderBy });
  }

  async createInvoice(data: Record<string, unknown>) {
    if (!data.assinaturaId) {
      throw new ValidationError('Assinatura é obrigatória');
    }

    if (typeof data.valor !== 'number') {
      throw new ValidationError('Valor é obrigatório');
    }

    if (data.numero) {
      const existing = await invoiceRepository.list({ where: { numero: data.numero } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe uma fatura com este número');
      }
    }

    return this.repository.create(data);
  }

  async updateInvoice(id: string, data: Record<string, unknown>) {
    if (data.numero) {
      const existing = await invoiceRepository.list({ where: { numero: data.numero, id: { not: id } } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe uma fatura com este número');
      }
    }

    return this.repository.update(id, data);
  }
}

export default new InvoiceService();
