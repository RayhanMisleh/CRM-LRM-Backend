import BaseRepository from './baseRepository';

class ContractRepository extends BaseRepository<'contrato'> {
  constructor() {
    super('contrato');
  }
}

export default new ContractRepository();
