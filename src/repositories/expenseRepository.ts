import BaseRepository from './baseRepository';

class ExpenseRepository extends BaseRepository<'despesa'> {
  constructor() {
    super('despesa');
  }
}

export default new ExpenseRepository();
