import { NextFunction, Request, Response } from 'express';
import meetingService from '../services/meetingService';
import { sendSuccess } from '../utils/response';

class MeetingController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await meetingService.listMeetings(req.query);
      return sendSuccess(res, 200, result.data, {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const meeting = await meetingService.getById(req.params.id);
      return sendSuccess(res, 200, meeting);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const meeting = await meetingService.createMeeting(req.body);
      return sendSuccess(res, 201, meeting);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const meeting = await meetingService.updateMeeting(req.params.id, req.body);
      return sendSuccess(res, 200, meeting);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await meetingService.delete(req.params.id);
      return sendSuccess(res, 200, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}

export default new MeetingController();
