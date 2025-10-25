import BaseRepository from './baseRepository';

class SubscriptionRepository extends BaseRepository<'assinatura'> {
  constructor() {
    super('assinatura');
  }
}

export default new SubscriptionRepository();
