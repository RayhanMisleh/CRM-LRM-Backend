import BaseRepository from './baseRepository';

class ClientRepository extends BaseRepository<'client'> {
  constructor() {
    super('client');
  }
}

export default new ClientRepository();
