import BaseRepository from './baseRepository';

class ClientServiceRepository extends BaseRepository<'clientService'> {
  constructor() {
    super('clientService');
  }
}

export default new ClientServiceRepository();
