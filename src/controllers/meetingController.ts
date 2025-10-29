import { Request, Response } from 'express';

import meetingService from '../services/meetingService';
import { asyncHandler, sendSuccess } from '../lib/http';
import { CreateMeetingInput, ListMeetingsQuery, UpdateMeetingInput } from '../validators/meeting';

class MeetingController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = (req.validated?.query ?? req.query) as ListMeetingsQuery;
    const result = await meetingService.listMeetings(query);
    return sendSuccess(res, 200, result.data, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const meeting = await meetingService.getById(id);
    return sendSuccess(res, 200, meeting);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const payload = (req.validated?.body ?? req.body) as CreateMeetingInput;
    const meeting = await meetingService.createMeeting(payload);
    return sendSuccess(res, 201, meeting);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    const payload = (req.validated?.body ?? req.body) as UpdateMeetingInput;
    const meeting = await meetingService.updateMeeting(id, payload);
    return sendSuccess(res, 200, meeting);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req.validated?.params ?? req.params) as { id: string };
    await meetingService.delete(id);
    return sendSuccess(res, 200, { id });
  });
}

export default new MeetingController();
