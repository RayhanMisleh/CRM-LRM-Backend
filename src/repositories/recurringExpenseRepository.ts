import BaseRepository from './baseRepository';

class RecurringExpenseRepository extends BaseRepository<'despesaRecorrente'> {
  constructor() {
    super('despesaRecorrente');
  }
}

export default new RecurringExpenseRepository();
