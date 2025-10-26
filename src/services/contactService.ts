import BaseService from './baseService';
import contactRepository from '../repositories/contactRepository';
import { ConflictError, ValidationError } from '../utils/httpErrors';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';

class ContactService extends BaseService<typeof contactRepository, unknown> {
  private readonly sortableFields = new Set(['name', 'email', 'phone', 'createdAt', 'updatedAt']);

  constructor() {
    super(contactRepository);
  }

  async listContacts(query: Record<string, unknown>) {
    const pagination = parsePagination(query.page as string | undefined, query.pageSize as string | undefined);
    const { sortBy, sortOrder } = parseSort(query.sortBy as string | undefined, query.sortOrder as string | undefined);
    const { startDate, endDate } = parseDateFilters(query.startDate as string | undefined, query.endDate as string | undefined);

    const where: Record<string, unknown> = {};

    const search = query.search as string | undefined;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const status = query.status as string | undefined;
    if (status === 'linked') {
      where.clientId = { not: null };
    }
    if (status === 'unlinked') {
      where.clientId = null;
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

  async createContact(data: Record<string, unknown>) {
    if (!data.name) {
      throw new ValidationError('Nome é obrigatório');
    }

    if (!data.email && !data.phone) {
      throw new ValidationError('Informe email ou telefone');
    }

    if (data.email) {
      const existing = await contactRepository.list({ where: { email: data.email } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe um contato com este email');
      }
    }

    return this.repository.create(data);
  }

  async updateContact(id: string, data: Record<string, unknown>) {
    if (data.email) {
      const existing = await contactRepository.list({ where: { email: data.email, id: { not: id } } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe um contato com este email');
      }
    }

    return this.repository.update(id, data);
  }
}

export default new ContactService();
