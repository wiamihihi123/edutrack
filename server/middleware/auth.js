const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { getDatabase } = require('../config/database');

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Token d\'authentification requis',
      message: 'Veuillez vous connecter pour accéder à cette ressource'
    });
  }
  
  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expiré',
          message: 'Votre session a expiré, veuillez vous reconnecter'
        });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Token invalide',
          message: 'Token d\'authentification invalide'
        });
      } else {
        return res.status(401).json({ 
          error: 'Erreur d\'authentification',
          message: 'Impossible de vérifier le token'
        });
      }
    }
    
    req.user = user;
    next();
  });
};

// Middleware pour vérifier les rôles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Non authentifié',
        message: 'Veuillez vous connecter'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource'
      });
    }
    
    next();
  };
};

// Middleware pour vérifier si l'utilisateur est propriétaire de la ressource ou admin
const requireOwnershipOrAdmin = (resourceIdField = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Non authentifié',
        message: 'Veuillez vous connecter'
      });
    }
    
    // Les administrateurs ont accès à tout
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Vérifier si l'utilisateur est propriétaire de la ressource
    const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
    
    if (!resourceId) {
      return res.status(400).json({ 
        error: 'ID de ressource manquant',
        message: 'Impossible de déterminer la ressource à vérifier'
      });
    }
    
    // Si l'utilisateur est propriétaire de la ressource
    if (req.user.id === parseInt(resourceId)) {
      return next();
    }
    
    return res.status(403).json({ 
      error: 'Accès refusé',
      message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource'
    });
  };
};

// Middleware pour vérifier les permissions spécifiques
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Non authentifié',
        message: 'Veuillez vous connecter'
      });
    }
    
    // Les administrateurs ont toutes les permissions
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Définir les permissions par rôle
    const rolePermissions = {
      teacher: [
        'courses.read', 'courses.create', 'courses.update',
        'grades.read', 'grades.create', 'grades.update',
        'attendance.read', 'attendance.create', 'attendance.update',
        'classes.read', 'subjects.read', 'students.read'
      ],
      student: [
        'profile.read', 'profile.update',
        'grades.read', 'attendance.read',
        'courses.read', 'classes.read'
      ]
    };
    
    const userPermissions = rolePermissions[req.user.role] || [];
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ 
        error: 'Permission insuffisante',
        message: `Vous n'avez pas la permission '${permission}'`
      });
    }
    
    next();
  };
};

// Middleware pour vérifier si l'utilisateur est actif
const requireActiveUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Non authentifié',
      message: 'Veuillez vous connecter'
    });
  }
  
  // Vérifier si l'utilisateur est actif (cette vérification peut être étendue)
  if (req.user.isActive === false) {
    return res.status(403).json({ 
      error: 'Compte désactivé',
      message: 'Votre compte a été désactivé. Veuillez contacter l\'administrateur.'
    });
  }
  
  next();
};

// Middleware pour logger les tentatives d'accès
const logAccess = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const userId = req.user ? req.user.id : 'anonymous';
  const userRole = req.user ? req.user.role : 'anonymous';
  const userAgent = req.get('User-Agent');
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - User: ${userId} (${userRole}) - IP: ${ip} - UA: ${userAgent}`);
  
  next();
};

// Middleware pour vérifier la limite de taux par utilisateur
const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();
  
  return (req, res, next) => {
    if (!req.user) {
      return next(); // Pas de limite pour les utilisateurs non authentifiés
    }
    
    const userId = req.user.id;
    const now = Date.now();
    
    if (!userRequests.has(userId)) {
      userRequests.set(userId, { count: 0, resetTime: now + windowMs });
    }
    
    const userData = userRequests.get(userId);
    
    // Réinitialiser le compteur si la fenêtre de temps est écoulée
    if (now > userData.resetTime) {
      userData.count = 0;
      userData.resetTime = now + windowMs;
    }
    
    // Vérifier la limite
    if (userData.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Limite de taux dépassée',
        message: `Vous avez dépassé la limite de ${maxRequests} requêtes par ${windowMs / 1000 / 60} minutes`,
        retryAfter: Math.ceil((userData.resetTime - now) / 1000)
      });
    }
    
    userData.count++;
    next();
  };
};

// Middleware pour exiger les droits administrateur
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Non authentifié',
      message: 'Veuillez vous connecter avec un compte administrateur'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Accès refusé',
      message: 'Droits administrateur requis pour cette action'
    });
  }
  
  next();
};
// Middleware pour vérifier l'accès aux données de classe
const canAccessClassData = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Non authentifié',
      message: 'Veuillez vous connecter'
    });
  }

  // Les administrateurs et les professeurs ont accès à toutes les classes
  if (req.user.role === 'admin' || req.user.role === 'teacher') {
    return next();
  }

  // Les étudiants ne peuvent voir que leurs propres données de classe
  if (req.user.role === 'student') {
    const classId = parseInt(req.params.id);
    const database = getDatabase();
    
    database.get(
      'SELECT 1 FROM student_class WHERE studentId = ? AND classId = ? AND isActive = 1',
      [req.user.id, classId],
      (err, result) => {
        if (err) {
          console.error('Erreur de base de données:', err);
          return res.status(500).json({
            error: 'Erreur serveur',
            message: 'Impossible de vérifier les permissions de la classe'
          });
        }

        if (!result) {
          return res.status(403).json({
            error: 'Accès refusé',
            message: 'Vous n\'avez pas accès à cette classe'
          });
        }

        next();
      }
    );
  } else {
    return res.status(403).json({
      error: 'Accès refusé',
      message: 'Vous n\'avez pas les permissions nécessaires'
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireOwnershipOrAdmin,
  requirePermission,
  requireActiveUser,
  logAccess,
  rateLimitByUser,
  canAccessOwnData: requireOwnershipOrAdmin,
  canAccessClassData
};
