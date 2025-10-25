const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

class SessionService {
  /**
   * Registra um novo usuário
   */
  async signUp({ email, password, name, role, empresaId }) {
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email já está em uso");
    }

    // Validar empresaId se fornecido
    if (empresaId) {
      const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
      });

      if (!empresa) {
        throw new Error("Empresa não encontrada");
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || "USER",
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

    // Gerar token JWT
    const token = this.generateToken(user);

    // Criar sessão no banco

    return {
      user,
      token
    };
  }

  /**
   * Faz login de um usuário
   */
  async login({ email, password }) {
    // Buscar usuário
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
      throw new Error("Credenciais inválidas");
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Credenciais inválidas");
    }

    // Gerar token JWT
    const token = this.generateToken(user);

    // Criar sessão no banco
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      },
    });

    // Remover senha do objeto de retorno
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      sessionId: session.id,
    };
  }

  /**
   * Faz logout de um usuário (invalida a sessão)
   */
  async logout(token) {
    // Buscar e deletar a sessão pelo token
    const session = await prisma.session.findFirst({
      where: { token },
    });

    if (session) {
      await prisma.session.delete({
        where: { id: session.id },
      });
    }

    return { message: "Logout realizado com sucesso" };
  }

  /**
   * Valida uma sessão existente
   */
  async validateSession(token) {
    const session = await prisma.session.findFirst({
      where: {
        token,
        expiresAt: {
          gte: new Date(),
        },
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
      throw new Error("Sessão inválida ou expirada");
    }

    return session.user;
  }

  /**
   * Renova uma sessão existente
   */
  async refreshSession(token) {
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
      throw new Error("Sessão não encontrada");
    }

    // Gerar novo token
    const newToken = this.generateToken(session.user);

    // Atualizar sessão
    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: {
        token: newToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      },
    });

    return {
      token: newToken,
      sessionId: updatedSession.id,
    };
  }

  /**
   * Limpa sessões expiradas
   */
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

  /**
   * Gera um token JWT
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      empresaId: user.empresaId,
    };

    return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    });
  }

  /**
   * Decodifica e verifica um token JWT
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    } catch (error) {
      throw new Error("Token inválido");
    }
  }
}

module.exports = new SessionService();
