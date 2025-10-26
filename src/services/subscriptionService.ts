import BaseService from './baseService';
import subscriptionRepository from '../repositories/subscriptionRepository';
import { ConflictError, ValidationError } from '../utils/httpErrors';
import { parseDateFilters, parsePagination, parseSort } from '../utils/queryParsers';

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

  async listSubscriptions(query: Record<string, unknown>) {
    const pagination = parsePagination(query.page as string | undefined, query.pageSize as string | undefined);
    const { sortBy, sortOrder } = parseSort(query.sortBy as string | undefined, query.sortOrder as string | undefined);
    const { startDate, endDate } = parseDateFilters(query.startDate as string | undefined, query.endDate as string | undefined);

    const where: Record<string, unknown> = {};

    const status = query.status as string | undefined;
    if (status) {
      where.status = status;
    }

    const clientId = query.clientId as string | undefined;
    if (clientId) {
      where.clientId = clientId;
    }

    const planId = query.planId as string | undefined;
    if (planId) {
      where.planId = planId;
    }

    const search = query.search as string | undefined;
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

  async createSubscription(data: Record<string, unknown>) {
    if (!data.clientId) {
      throw new ValidationError('Cliente é obrigatório');
    }

    if (!data.planId) {
      throw new ValidationError('Plano é obrigatório');
    }

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

  async updateSubscription(id: string, data: Record<string, unknown>) {
    if (data.status && !['PENDING', 'ACTIVE', 'PAUSED', 'CANCELLED', 'TERMINATED'].includes(data.status as string)) {
      throw new ValidationError('Status de assinatura inválido');
    }

    return this.repository.update(id, data);
  }
}

export default new SubscriptionService();
