import BaseService from './baseService';
import subscriptionRepository from '../repositories/subscriptionRepository';
import { ConflictError } from '../lib/http';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';
import {
  CreateSubscriptionInput,
  ListSubscriptionsQuery,
  UpdateSubscriptionInput,
} from '../validators/subscription';

class SubscriptionService extends BaseService<typeof subscriptionRepository, unknown> {
  private readonly sortableFields = new Set([
    'status',
    'startDate',
    'endDate',
    'createdAt',
    'updatedAt',
  ]);

  constructor() {
    super(subscriptionRepository);
  }

  async listSubscriptions(query: ListSubscriptionsQuery) {
    const pagination = parsePagination(query.page, query.pageSize);
    const { sortBy, sortOrder } = parseSort(query.sortBy, query.sortOrder);
    const { startDate, endDate } = parseDateFilters(query.startDate, query.endDate);

    const where: Record<string, unknown> = {};

    const status = query.status;
    if (status) {
      where.status = status;
    }

    const clientId = query.clientId;
    if (clientId) {
      where.clientId = clientId;
    }

    const planId = query.planId;
    if (planId) {
      where.planId = planId;
    }

    const search = query.search;
    if (search) {
      where.OR = [
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { plan: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (startDate || endDate) {
      where.startDate = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      };
    }

    const orderBy = sortBy && this.sortableFields.has(sortBy)
      ? { [sortBy]: sortOrder }
      : { createdAt: 'desc' };

    return this.list({ pagination, where, orderBy });
  }

  async createSubscription(data: CreateSubscriptionInput) {
    const activeSubscription = await subscriptionRepository.list({
      where: {
        clientId: data.clientId,
        planId: data.planId,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
    });

    if (activeSubscription.length > 0) {
      throw new ConflictError('Já existe uma assinatura ativa ou pendente para este plano e cliente');
    }

    return this.repository.create(data);
  }

  async updateSubscription(id: string, data: UpdateSubscriptionInput) {
    return this.repository.update(id, data);
  }
}

export default new SubscriptionService();
