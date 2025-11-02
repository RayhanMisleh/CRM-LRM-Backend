import BaseRepository, { ListParams } from './baseRepository';

class ClientServiceRepository extends BaseRepository<'clientService'> {
  private readonly baseSelect = {
    id: true,
    clientId: true,
    contractId: true,
    externalId: true,
    title: true,
    category: true,
    scope: true,
    status: true,
    responsible: true,
    hostingProvider: true,
    repositoryUrls: true,
    environmentLinks: true,
    monthlyFee: true,
    developmentFee: true,
    currency: true,
    billingCycle: true,
    supportLevel: true,
    startDate: true,
    goLiveDate: true,
    endDate: true,
    createdAt: true,
    updatedAt: true,
    client: {
      select: {
        id: true,
        name: true,
        status: true,
      },
    },
    contract: {
      select: {
        id: true,
        reference: true,
        title: true,
        status: true,
      },
    },
  };

  constructor() {
    super('clientService');
  }

  list(params: ListParams) {
    const { skip, take, where, orderBy } = params;
    return this.model.findMany({
      skip,
      take,
      where,
      orderBy,
      select: this.baseSelect,
    });
  }

  findById(id: string) {
    return this.model.findUnique({
      where: { id },
      select: this.baseSelect,
    });
  }

  create<TData>(data: TData) {
    return this.model.create({
      data,
      select: this.baseSelect,
    });
  }

  update<TData>(id: string, data: TData) {
    return this.model.update({
      where: { id },
      data,
      select: this.baseSelect,
    });
  }
}

export default new ClientServiceRepository();
