import BaseRepository from './baseRepository';

class MeetingRepository extends BaseRepository<'meeting'> {
  constructor() {
    super('meeting');
  }
}

export default new MeetingRepository();
