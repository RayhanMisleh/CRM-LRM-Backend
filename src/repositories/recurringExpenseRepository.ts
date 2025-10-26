import BaseRepository from './baseRepository';

class RecurringExpenseRepository extends BaseRepository<'recurringExpense'> {
  constructor() {
    super('recurringExpense');
  }
}

export default new RecurringExpenseRepository();
