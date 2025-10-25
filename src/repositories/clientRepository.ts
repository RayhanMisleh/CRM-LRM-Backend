import BaseRepository from './baseRepository';

class ClientRepository extends BaseRepository<'cliente'> {
  constructor() {
    super('cliente');
  }
}

export default new ClientRepository();
