import BaseRepository from './baseRepository';

class SubscriptionRepository extends BaseRepository<'subscription'> {
  constructor() {
    super('subscription');
  }
}

export default new SubscriptionRepository();
