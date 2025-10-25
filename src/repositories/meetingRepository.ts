import BaseRepository from './baseRepository';

class MeetingRepository extends BaseRepository<'reuniao'> {
  constructor() {
    super('reuniao');
  }
}

export default new MeetingRepository();
