import BaseRepository from './baseRepository';

class PlanRepository extends BaseRepository<'plano'> {
  constructor() {
    super('plano');
  }
}

export default new PlanRepository();
