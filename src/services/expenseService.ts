import BaseService from './baseService';
import expenseRepository from '../repositories/expenseRepository';
import { ValidationError } from '../utils/httpErrors';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';

class ExpenseService extends BaseService<typeof expenseRepository, unknown> {
  private readonly sortableFields = new Set(['descricao', 'valor', 'data', 'createdAt', 'updatedAt']);

  constructor() {
    super(expenseRepository);
  }

  async listExpenses(query: Record<string, unknown>) {
    const pagination = parsePagination(query.page as string | undefined, query.pageSize as string | undefined);
    const { sortBy, sortOrder } = parseSort(query.sortBy as string | undefined, query.sortOrder as string | undefined);
    const { startDate, endDate } = parseDateFilters(query.startDate as string | undefined, query.endDate as string | undefined);

    const where: Record<string, unknown> = {};

    const search = query.search as string | undefined;
    if (search) {
      where.OR = [
        { descricao: { contains: search, mode: 'insensitive' } },
        { categoria: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.data = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const orderBy = sortBy && this.sortableFields.has(sortBy)
      ? { [sortBy]: sortOrder }
      : { data: 'desc' };

    return this.list({ pagination, where, orderBy });
  }

  async createExpense(data: Record<string, unknown>) {
    if (!data.descricao) {
      throw new ValidationError('Descrição é obrigatória');
    }

    if (typeof data.valor !== 'number') {
      throw new ValidationError('Valor é obrigatório');
    }

    if (!data.userId) {
      throw new ValidationError('Usuário responsável é obrigatório');
    }

    return this.repository.create(data);
  }

  async updateExpense(id: string, data: Record<string, unknown>) {
    return this.repository.update(id, data);
  }
}

export default new ExpenseService();
