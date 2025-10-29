import BaseService from './baseService';
import expenseRepository from '../repositories/expenseRepository';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';
import { CreateExpenseInput, ListExpensesQuery, UpdateExpenseInput } from '../validators/expense';

class ExpenseService extends BaseService<typeof expenseRepository, unknown> {
  private readonly sortableFields = new Set([
    'title',
    'amount',
    'incurredAt',
    'createdAt',
    'updatedAt',
  ]);

  constructor() {
    super(expenseRepository);
  }

  async listExpenses(query: ListExpensesQuery) {
    const pagination = parsePagination(query.page, query.pageSize);
    const { sortBy, sortOrder } = parseSort(query.sortBy, query.sortOrder);
    const { startDate, endDate } = parseDateFilters(query.startDate, query.endDate);

    const where: Record<string, unknown> = {};

    const search = query.search;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (query.clientId) {
      where.clientId = query.clientId;
    }

    if (query.clientServiceId) {
      where.clientServiceId = query.clientServiceId;
    }

    if (query.serviceBillingId) {
      where.serviceBillingId = query.serviceBillingId;
    }

    if (query.invoiceId) {
      where.invoiceId = query.invoiceId;
    }

    const kind = query.kind;
    if (kind) {
      where.kind = kind;
    }

    if (startDate || endDate) {
      where.incurredAt = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const orderBy =
      sortBy && this.sortableFields.has(sortBy) ? { [sortBy]: sortOrder } : { incurredAt: 'desc' };

    return this.list({ pagination, where, orderBy });
  }

  async createExpense(data: CreateExpenseInput) {
    return this.repository.create(data);
  }

  async updateExpense(id: string, data: UpdateExpenseInput) {
    return this.repository.update(id, data);
  }
}

export default new ExpenseService();
