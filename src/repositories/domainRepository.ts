import BaseRepository from './baseRepository';

class DomainRepository extends BaseRepository<'domain'> {
  constructor() {
    super('domain');
  }
}

export default new DomainRepository();
