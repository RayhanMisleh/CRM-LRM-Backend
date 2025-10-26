import BaseService from './baseService';
import contactRepository from '../repositories/contactRepository';
import { ConflictError } from '../lib/http';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';
import {
  CreateContactInput,
  ListContactsQuery,
  UpdateContactInput,
} from '../validators/contact';

class ContactService extends BaseService<typeof contactRepository, unknown> {
  private readonly sortableFields = new Set(['name', 'email', 'phone', 'createdAt', 'updatedAt']);

  constructor() {
    super(contactRepository);
  }

  async listContacts(query: ListContactsQuery) {
    const pagination = parsePagination(query.page, query.pageSize);
    const { sortBy, sortOrder } = parseSort(query.sortBy, query.sortOrder);
    const { startDate, endDate } = parseDateFilters(query.startDate, query.endDate);

    const where: Record<string, unknown> = {};

    const search = query.search;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const status = query.status;
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

  async createContact(data: CreateContactInput) {
    if (data.email) {
      const existing = await contactRepository.list({ where: { email: data.email } });
      if (existing.length > 0) {
        throw new ConflictError('Já existe um contato com este email');
      }
    }

    return this.repository.create(data);
  }

  async updateContact(id: string, data: UpdateContactInput) {
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
