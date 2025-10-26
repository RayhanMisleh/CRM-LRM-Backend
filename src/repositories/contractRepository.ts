import BaseRepository from './baseRepository';

class ContractRepository extends BaseRepository<'contract'> {
  constructor() {
    super('contract');
  }
}

export default new ContractRepository();
