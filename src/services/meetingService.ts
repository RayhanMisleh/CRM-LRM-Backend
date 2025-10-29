import BaseService from './baseService';
import meetingRepository from '../repositories/meetingRepository';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';
import { CreateMeetingInput, ListMeetingsQuery, UpdateMeetingInput } from '../validators/meeting';

class MeetingService extends BaseService<typeof meetingRepository, unknown> {
  private readonly sortableFields = new Set(['title', 'scheduledAt', 'createdAt', 'updatedAt']);

  constructor() {
    super(meetingRepository);
  }

  async listMeetings(query: ListMeetingsQuery) {
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

    const clientId = query.clientId;
    if (clientId) {
      where.clientId = clientId;
    }

    if (startDate || endDate) {
      where.scheduledAt = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const orderBy =
      sortBy && this.sortableFields.has(sortBy) ? { [sortBy]: sortOrder } : { scheduledAt: 'desc' };

    return this.list({ pagination, where, orderBy });
  }

  async createMeeting(data: CreateMeetingInput) {
    return this.repository.create(data);
  }

  async updateMeeting(id: string, data: UpdateMeetingInput) {
    return this.repository.update(id, data);
  }
}

export default new MeetingService();
