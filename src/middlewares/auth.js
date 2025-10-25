const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const auth = async (req, res, next) => {
  try {
    // Get token from header or cookie
    let token = req.header("Authorization");

    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7); // Remove 'Bearer ' prefix
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        error: "Access denied",
        message: "No token provided",
      });
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if session exists in database
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
        return res.status(401).json({
          error: "Invalid token",
          message: "Session not found",
        });
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        // Delete expired session
        await prisma.session.delete({
          where: { id: session.id },
        });

        return res.status(401).json({
          error: "Token expired",
          message: "Please login again",
        });
      }

      // Add user info to request - seguindo o padrão SaaS
      req.user_id = session.user.id;
      req.user_email = session.user.email;
      req.user_role = session.user.role;
      req.user_empresa_id = session.user.empresaId;
      req.session_id = session.id;

      // Para compatibilidade com códigos que possam usar req.user
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        empresaId: session.user.empresaId,
        empresa: session.user.empresa,
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({
        error: "Invalid token",
        message: "Token verification failed",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Authentication failed",
    });
  }
};

module.exports = auth;
