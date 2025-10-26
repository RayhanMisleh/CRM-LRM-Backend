import BaseRepository from './baseRepository';

class InvoiceRepository extends BaseRepository<'invoice'> {
  constructor() {
    super('invoice');
  }
}

export default new InvoiceRepository();
