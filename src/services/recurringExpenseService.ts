import BaseService from './baseService';
import recurringExpenseRepository from '../repositories/recurringExpenseRepository';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';
import {
  CreateRecurringExpenseInput,
  ListRecurringExpensesQuery,
  UpdateRecurringExpenseInput,
} from '../validators/recurringExpense';

class RecurringExpenseService extends BaseService<typeof recurringExpenseRepository, unknown> {
  private readonly sortableFields = new Set(['title', 'amount', 'frequency', 'nextOccurrence', 'createdAt', 'updatedAt']);

  constructor() {
    super(recurringExpenseRepository);
  }

  async listRecurringExpenses(query: ListRecurringExpensesQuery) {
    const pagination = parsePagination(query.page, query.pageSize);
    const { sortBy, sortOrder } = parseSort(query.sortBy, query.sortOrder);
    const { startDate, endDate } = parseDateFilters(query.startDate, query.endDate);

    const where: Record<string, unknown> = {};

    const search = query.search;
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const frequency = query.frequency;
    if (frequency) {
      where.frequency = frequency;
    }

    const kind = query.kind;
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

  async createRecurringExpense(data: CreateRecurringExpenseInput) {
    return this.repository.create(data);
  }

  async updateRecurringExpense(id: string, data: UpdateRecurringExpenseInput) {
    return this.repository.update(id, data);
  }
}

export default new RecurringExpenseService();
