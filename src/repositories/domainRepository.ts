import BaseRepository from './baseRepository';

class DomainRepository extends BaseRepository<'dominio'> {
  constructor() {
    super('dominio');
  }
}

export default new DomainRepository();
