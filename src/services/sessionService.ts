import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

import prisma from '../lib/db';
import { ConflictError, NotFoundError, UnauthorizedError } from '../lib/http';
import { env } from '../lib/env';
import { LoginInput, SignUpInput } from '../validators/session';

interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  empresaId?: string | null;
}

interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  empresaId: string | null;
  createdAt: Date;
  empresa: {
    id: string;
    nome: string;
  } | null;
}

class SessionService {
  async signUp({ email, password, name, role, empresaId }: SignUpInput) {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictError('Email já está em uso');
    }

    if (empresaId) {
      const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
      if (!empresa) {
        throw new NotFoundError('Empresa não encontrada');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role ?? 'USER',
        empresaId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        empresaId: true,
        createdAt: true,
        empresa: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    const token = this.generateToken(user);
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: this.getSessionExpiry(),
      },
    });

    return { user, token, sessionId: session.id };
  }

  async login({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        empresa: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const token = this.generateToken(user);
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: this.getSessionExpiry(),
      },
    });

    const { password: _password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      sessionId: session.id,
    };
  }

  async logout(token: string) {
    const session = await prisma.session.findFirst({ where: { token } });

    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }

    return { message: 'Logout realizado com sucesso' };
  }

  async validateSession(token: string) {
    const session = await prisma.session.findFirst({
      where: {
        token,
        expiresAt: { gte: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            empresaId: true,
            empresa: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedError('Sessão inválida ou expirada');
    }

    return session.user;
  }

  async refreshSession(token: string) {
    const session = await prisma.session.findFirst({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            empresaId: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Sessão não encontrada');
    }

    const newToken = this.generateToken(session.user as AuthenticatedUser);

    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: {
        token: newToken,
        expiresAt: this.getSessionExpiry(),
      },
    });

    return {
      token: newToken,
      sessionId: updatedSession.id,
    };
  }

  async cleanExpiredSessions() {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return { deletedCount: result.count };
  }

  generateToken(user: TokenPayload | AuthenticatedUser) {
    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      empresaId: user.empresaId,
    };

    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
  }

  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      if (typeof decoded === 'string') {
        return JSON.parse(decoded) as TokenPayload;
      }

      return decoded as TokenPayload & JwtPayload;
    } catch (error) {
      throw new UnauthorizedError('Token inválido', error);
    }
  }

  private getSessionExpiry() {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
}

export default new SessionService();
