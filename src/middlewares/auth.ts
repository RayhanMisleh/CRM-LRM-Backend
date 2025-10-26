import { NextFunction, Request, Response } from 'express';

import prisma from '../lib/db';
import { toHttpError, UnauthorizedError } from '../lib/http';
import sessionService from '../services/sessionService';

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.header('Authorization');

    if (token?.startsWith('Bearer ')) {
      token = token.slice(7);
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new UnauthorizedError('Token não fornecido');
    }

    sessionService.verifyToken(token);

    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            empresa: true,
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedError('Sessão não encontrada');
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedError('Sessão expirada');
    }

    req.user_id = session.user.id;
    req.user_email = session.user.email;
    req.user_role = session.user.role;
    req.user_empresa_id = session.user.empresaId;
    req.session_id = session.id;
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      empresaId: session.user.empresaId,
      empresa: session.user.empresa,
    };

    next();
  } catch (error) {
    next(toHttpError(error));
  }
};

export default auth;
