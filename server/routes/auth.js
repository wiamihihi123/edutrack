const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../config/database');

const router = express.Router();

// Validation pour la connexion
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
];

// Validation pour l'inscription
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName').trim().isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  body('role').isIn(['admin', 'teacher', 'student']).withMessage('Rôle invalide'),
  body('phone').optional().isMobilePhone().withMessage('Numéro de téléphone invalide')
];

// Route de connexion
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { email, password } = req.body;
    const database = getDatabase();

    // Rechercher l'utilisateur par email
    database.get(
      'SELECT * FROM users WHERE email = ? AND isActive = 1',
      [email],
      async (err, user) => {
        if (err) {
          console.error('Erreur de base de données:', err);
          return res.status(500).json({
            error: 'Erreur serveur',
            message: 'Impossible de vérifier les informations de connexion'
          });
        }

        if (!user) {
          return res.status(401).json({
            error: 'Authentification échouée',
            message: 'Email ou mot de passe incorrect'
          });
        }

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({
            error: 'Authentification échouée',
            message: 'Email ou mot de passe incorrect'
          });
        }

        // Créer le token JWT
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Retourner les informations de l'utilisateur (sans le mot de passe)
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
          message: 'Connexion réussie',
          user: userWithoutPassword,
          token,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        });
      }
    );
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la connexion'
    });
  }
});

// Route d'inscription (réservée aux administrateurs)
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { email, password, firstName, lastName, role, phone, address, birthDate } = req.body;
    const database = getDatabase();

    // Vérifier si l'email existe déjà
    database.get(
      'SELECT id FROM users WHERE email = ?',
      [email],
      async (err, existingUser) => {
        if (err) {
          console.error('Erreur de base de données:', err);
          return res.status(500).json({
            error: 'Erreur serveur',
            message: 'Impossible de vérifier l\'email'
          });
        }

        if (existingUser) {
          return res.status(400).json({
            error: 'Email déjà utilisé',
            message: 'Un compte avec cet email existe déjà'
          });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

        // Créer l'utilisateur
        database.run(
          `INSERT INTO users (email, password, firstName, lastName, role, phone, address, birthDate)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [email, hashedPassword, firstName, lastName, role, phone || null, address || null, birthDate || null],
          function(err) {
            if (err) {
              console.error('Erreur lors de la création de l\'utilisateur:', err);
              return res.status(500).json({
                error: 'Erreur serveur',
                message: 'Impossible de créer l\'utilisateur'
              });
            }

            // Récupérer l'utilisateur créé
            database.get(
              'SELECT * FROM users WHERE id = ?',
              [this.lastID],
              (err, newUser) => {
                if (err) {
                  console.error('Erreur lors de la récupération de l\'utilisateur:', err);
                  return res.status(500).json({
                    error: 'Erreur serveur',
                    message: 'Utilisateur créé mais impossible de récupérer les informations'
                  });
                }

                const { password: _, ...userWithoutPassword } = newUser;
                
                res.status(201).json({
                  message: 'Utilisateur créé avec succès',
                  user: userWithoutPassword
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'inscription'
    });
  }
});

// Route de vérification du token
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Token manquant',
      message: 'Un token d\'authentification est requis'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        error: 'Token invalide',
        message: 'Le token d\'authentification est invalide ou expiré'
      });
    }

    res.json({
      message: 'Token valide',
      user: decoded
    });
  });
});

// Route de changement de mot de passe
router.post('/change-password', [
  body('currentPassword').isLength({ min: 6 }).withMessage('Le mot de passe actuel doit contenir au moins 6 caractères'),
  body('newPassword').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // Doit être fourni par le middleware d'authentification
    const database = getDatabase();

    // Récupérer l'utilisateur
    database.get(
      'SELECT password FROM users WHERE id = ?',
      [userId],
      async (err, user) => {
        if (err) {
          console.error('Erreur de base de données:', err);
          return res.status(500).json({
            error: 'Erreur serveur',
            message: 'Impossible de récupérer les informations utilisateur'
          });
        }

        if (!user) {
          return res.status(404).json({
            error: 'Utilisateur non trouvé',
            message: 'L\'utilisateur spécifié n\'existe pas'
          });
        }

        // Vérifier le mot de passe actuel
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
          return res.status(400).json({
            error: 'Mot de passe incorrect',
            message: 'Le mot de passe actuel est incorrect'
          });
        }

        // Hasher le nouveau mot de passe
        const hashedNewPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);

        // Mettre à jour le mot de passe
        database.run(
          'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [hashedNewPassword, userId],
          function(err) {
            if (err) {
              console.error('Erreur lors de la mise à jour du mot de passe:', err);
              return res.status(500).json({
                error: 'Erreur serveur',
                message: 'Impossible de mettre à jour le mot de passe'
              });
            }

            res.json({
              message: 'Mot de passe mis à jour avec succès'
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors du changement de mot de passe'
    });
  }
});

module.exports = router;
