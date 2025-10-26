import BaseRepository from './baseRepository';

class ContactRepository extends BaseRepository<'contact'> {
  constructor() {
    super('contact');
  }
}

export default new ContactRepository();
