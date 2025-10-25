import BaseService from './baseService';
import recurringExpenseRepository from '../repositories/recurringExpenseRepository';
import { ValidationError } from '../utils/httpErrors';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';

class RecurringExpenseService extends BaseService<typeof recurringExpenseRepository, unknown> {
  private readonly sortableFields = new Set(['nome', 'valor', 'dia', 'status', 'createdAt', 'updatedAt']);

  constructor() {
    super(recurringExpenseRepository);
  }

  async listRecurringExpenses(query: Record<string, unknown>) {
    const pagination = parsePagination(query.page as string | undefined, query.pageSize as string | undefined);
    const { sortBy, sortOrder } = parseSort(query.sortBy as string | undefined, query.sortOrder as string | undefined);
    const { startDate, endDate } = parseDateFilters(query.startDate as string | undefined, query.endDate as string | undefined);

    const where: Record<string, unknown> = {};

    const status = query.status as string | undefined;
    if (status) {
      where.status = status;
    }

    const search = query.search as string | undefined;
    if (search) {
      where.nome = { contains: search, mode: 'insensitive' };
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
    if (!data.nome) {
      throw new ValidationError('Nome é obrigatório');
    }

    if (typeof data.valor !== 'number') {
      throw new ValidationError('Valor é obrigatório');
    }

    if (typeof data.dia !== 'number') {
      throw new ValidationError('Dia de cobrança é obrigatório');
    }

    if (!data.userId) {
      throw new ValidationError('Usuário responsável é obrigatório');
    }

    return this.repository.create(data);
  }

  async updateRecurringExpense(id: string, data: Record<string, unknown>) {
    return this.repository.update(id, data);
  }
}

export default new RecurringExpenseService();
