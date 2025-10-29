/**
 * Middleware para verificar se o usuário tem permissões de administrador
 * Funciona em um sistema SaaS onde existem diferentes níveis de admin
 */
const checkAdmin = (adminTypes = ['SUPER_ADMIN', 'ADMIN']) => {
  return (req, res, next) => {
    // Verificar se o usuário está autenticado
    if (!req.user_id || !req.user_role) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
      });
    }

    // Verificar se o usuário tem o nível de admin necessário
    if (!adminTypes.includes(req.user_role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Admin access required. Required roles: ${adminTypes.join(', ')}`,
        userRole: req.user_role,
      });
    }

    next();
  };
};

/**
 * Middleware específico para Super Admin (admin do sistema inteiro)
 */
const checkSuperAdmin = (req, res, next) => {
  if (!req.user_id || !req.user_role) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource',
    });
  }

  if (req.user_role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      error: 'Super Admin access required',
      message: 'Only Super Administrators can access this resource',
      userRole: req.user_role,
    });
  }

  next();
};

/**
 * Middleware para verificar admin da empresa
 * Verifica se o usuário é admin da própria empresa ou super admin
 */
const checkCompanyAdmin = (req, res, next) => {
  if (!req.user_id || !req.user_role) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource',
    });
  }

  const allowedRoles = ['SUPER_ADMIN', 'ADMIN'];

  if (!allowedRoles.includes(req.user_role)) {
    return res.status(403).json({
      error: 'Company Admin access required',
      message: 'Only Company Administrators can access this resource',
      userRole: req.user_role,
    });
  }

  // Se for ADMIN, deve ter empresa associada (exceto SUPER_ADMIN)
  if (req.user_role === 'ADMIN' && !req.user_empresa_id) {
    return res.status(403).json({
      error: 'Invalid admin configuration',
      message: 'Company admin must be associated with a company',
    });
  }

  next();
};

/**
 * Middleware para verificar se o usuário tem acesso aos dados de uma empresa específica
 * Usado para garantir isolamento de dados entre empresas no SaaS
 */
const checkCompanyAccess = (companyIdParam = 'empresaId') => {
  return (req, res, next) => {
    if (!req.user_id) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    const requestedCompanyId =
      req.params[companyIdParam] || req.body.empresaId || req.query.empresaId;

    // Super Admin pode acessar qualquer empresa
    if (req.user_role === 'SUPER_ADMIN') {
      return next();
    }

    // Outros usuários só podem acessar dados da própria empresa
    if (!req.user_empresa_id) {
      return res.status(403).json({
        error: 'No company association',
        message: 'User must be associated with a company',
      });
    }

    if (requestedCompanyId && requestedCompanyId !== req.user_empresa_id) {
      return res.status(403).json({
        error: 'Company access denied',
        message: 'You can only access data from your own company',
      });
    }

    next();
  };
};

/**
 * Middleware para verificar permissões por role específico
 */
const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user_id || !req.user_role) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user_role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        userRole: req.user_role,
      });
    }

    next();
  };
};

module.exports = {
  checkAdmin,
  checkSuperAdmin,
  checkCompanyAdmin,
  checkCompanyAccess,
  checkRole,
};
