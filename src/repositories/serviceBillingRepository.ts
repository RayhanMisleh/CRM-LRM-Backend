import BaseRepository from './baseRepository';

class ServiceBillingRepository extends BaseRepository<'serviceBilling'> {
  constructor() {
    super('serviceBilling');
  }
}

export default new ServiceBillingRepository();
