const { validationResult } = require("express-validator");
const sessionService = require("../services/sessionService");

class SessionController {
  /**
   * Registra um novo usuário
   */
  async signUp(req, res, next) {
    try {
      // Validar dados
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          data: null,
          error: {
            message: "Dados inválidos",
            details: errors.array(),
          },
        });
      }

      const { email, password, name, role, empresaId } = req.body;

      // Chamar service
      const result = await sessionService.signUp({
        email,
        password,
        name,
        role,
        empresaId,
      });

      // Configurar cookie com o token
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      });

      return res.status(201).json({
        data: {
          user: result.user,
          token: result.token,
          sessionId: result.sessionId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Faz login de um usuário
   */
  async login(req, res, next) {
    try {
      // Validar dados
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          data: null,
          error: {
            message: "Dados inválidos",
            details: errors.array(),
          },
        });
      }

      const { email, password } = req.body;

      // Chamar service
      const result = await sessionService.login({ email, password });

      // Configurar cookie com o token
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      });

      return res.status(200).json({
        data: {
          user: result.user,
          token: result.token,
          sessionId: result.sessionId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Faz logout do usuário
   */
  async logout(req, res, next) {
    try {
      const token =
        req.cookies.token || req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(400).json({
          data: null,
          error: {
            message: "Token não fornecido",
          },
        });
      }

      // Chamar service
      await sessionService.logout(token);

      // Limpar cookie
      res.clearCookie("token");

      return res.status(200).json({
        data: {
          message: "Logout realizado com sucesso",
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SessionController();
