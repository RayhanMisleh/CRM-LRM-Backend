import BaseService from './baseService';
import recurringExpenseRepository from '../repositories/recurringExpenseRepository';
import { ValidationError } from '../utils/httpErrors';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';

class RecurringExpenseService extends BaseService<typeof recurringExpenseRepository, unknown> {
  private readonly sortableFields = new Set(['title', 'amount', 'frequency', 'nextOccurrence', 'createdAt', 'updatedAt']);

  constructor() {
    super(recurringExpenseRepository);
  }

  async listRecurringExpenses(query: Record<string, unknown>) {
    const pagination = parsePagination(query.page as string | undefined, query.pageSize as string | undefined);
    const { sortBy, sortOrder } = parseSort(query.sortBy as string | undefined, query.sortOrder as string | undefined);
    const { startDate, endDate } = parseDateFilters(query.startDate as string | undefined, query.endDate as string | undefined);

    const where: Record<string, unknown> = {};

    const search = query.search as string | undefined;
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const frequency = query.frequency as string | undefined;
    if (frequency) {
      where.frequency = frequency;
    }

    const kind = query.kind as string | undefined;
    if (kind) {
      where.kind = kind;
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

  async createRecurringExpense(data: Record<string, unknown>) {
    if (!data.title) {
      throw new ValidationError('Título é obrigatório');
    }

    if (data.amount === undefined || data.amount === null || (typeof data.amount !== 'number' && typeof data.amount !== 'string')) {
      throw new ValidationError('Valor é obrigatório');
    }

    return this.repository.create(data);
  }

  async updateRecurringExpense(id: string, data: Record<string, unknown>) {
    return this.repository.update(id, data);
  }
}

export default new RecurringExpenseService();
