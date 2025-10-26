import BaseRepository from './baseRepository';

class PlanRepository extends BaseRepository<'plan'> {
  constructor() {
    super('plan');
  }
}

export default new PlanRepository();
