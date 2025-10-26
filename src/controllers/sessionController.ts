import { Request, Response } from 'express';

import sessionService from '../services/sessionService';
import { asyncHandler, sendSuccess, ValidationError } from '../lib/http';
import { env } from '../lib/env';
import { LoginInput, SignUpInput } from '../validators/session';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

class SessionController {
  signUp = asyncHandler(async (req: Request, res: Response) => {
    const payload = (req.validated?.body ?? req.body) as SignUpInput;
    const result = await sessionService.signUp(payload);

    this.setAuthCookie(res, result.token);

    return sendSuccess(res, 201, {
      user: result.user,
      token: result.token,
      sessionId: result.sessionId,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const payload = (req.validated?.body ?? req.body) as LoginInput;
    const result = await sessionService.login(payload);

    this.setAuthCookie(res, result.token);

    return sendSuccess(res, 200, {
      user: result.user,
      token: result.token,
      sessionId: result.sessionId,
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const token =
      req.cookies.token ?? req.headers.authorization?.replace('Bearer ', '') ?? null;

    if (!token) {
      throw new ValidationError('Token não fornecido');
    }

    await sessionService.logout(token);
    res.clearCookie('token');

    return sendSuccess(res, 200, { message: 'Logout realizado com sucesso' });
  });

  private setAuthCookie(res: Response, token: string) {
    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: COOKIE_MAX_AGE,
    });
  }
}

export default new SessionController();
