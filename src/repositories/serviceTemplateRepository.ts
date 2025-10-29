import BaseRepository from './baseRepository';

class ServiceTemplateRepository extends BaseRepository<'serviceTemplate'> {
  constructor() {
    super('serviceTemplate');
  }
}

export default new ServiceTemplateRepository();
