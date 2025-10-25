import BaseService from './baseService';
import meetingRepository from '../repositories/meetingRepository';
import { ValidationError } from '../utils/httpErrors';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';

class MeetingService extends BaseService<typeof meetingRepository, unknown> {
  private readonly sortableFields = new Set(['titulo', 'dataHora', 'createdAt', 'updatedAt']);

  constructor() {
    super(meetingRepository);
  }

  async listMeetings(query: Record<string, unknown>) {
    const pagination = parsePagination(query.page as string | undefined, query.pageSize as string | undefined);
    const { sortBy, sortOrder } = parseSort(query.sortBy as string | undefined, query.sortOrder as string | undefined);
    const { startDate, endDate } = parseDateFilters(query.startDate as string | undefined, query.endDate as string | undefined);

    const where: Record<string, unknown> = {};

    const search = query.search as string | undefined;
    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
      ];
    }

    const clientId = query.clientId as string | undefined;
    if (clientId) {
      where.clienteId = clientId;
    }

    if (startDate || endDate) {
      where.dataHora = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const orderBy = sortBy && this.sortableFields.has(sortBy)
      ? { [sortBy]: sortOrder }
      : { dataHora: 'desc' };

    return this.list({ pagination, where, orderBy });
  }

  async createMeeting(data: Record<string, unknown>) {
    if (!data.titulo) {
      throw new ValidationError('Título é obrigatório');
    }

    if (!data.dataHora) {
      throw new ValidationError('Data e hora são obrigatórias');
    }

    if (!data.userId) {
      throw new ValidationError('Usuário responsável é obrigatório');
    }

    return this.repository.create(data);
  }

  async updateMeeting(id: string, data: Record<string, unknown>) {
    return this.repository.update(id, data);
  }
}

export default new MeetingService();
