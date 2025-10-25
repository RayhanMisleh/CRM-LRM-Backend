import BaseRepository from './baseRepository';

class InvoiceRepository extends BaseRepository<'fatura'> {
  constructor() {
    super('fatura');
  }
}

export default new InvoiceRepository();
