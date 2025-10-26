import BaseRepository from './baseRepository';

class ExpenseRepository extends BaseRepository<'expense'> {
  constructor() {
    super('expense');
  }
}

export default new ExpenseRepository();
