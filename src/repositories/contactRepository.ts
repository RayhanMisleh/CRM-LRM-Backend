import BaseRepository from './baseRepository';

class ContactRepository extends BaseRepository<'contato'> {
  constructor() {
    super('contato');
  }
}

export default new ContactRepository();
