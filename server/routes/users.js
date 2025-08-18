const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../config/database');
const { requireAdmin, canAccessOwnData } = require('../middleware/auth');

const router = express.Router();

// Validation pour la création/modification d'utilisateur
const userValidation = [
  body('firstName').trim().isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('role').isIn(['admin', 'teacher', 'student']).withMessage('Rôle invalide'),
  body('phone').optional().isMobilePhone().withMessage('Numéro de téléphone invalide'),
  body('birthDate').optional().isISO8601().withMessage('Date de naissance invalide')
];

// GET /api/users - Récupérer tous les utilisateurs (admin seulement)
router.get('/', requireAdmin, (req, res) => {
  const database = getDatabase();
  const { role, isActive, search } = req.query;
  
  let query = 'SELECT id, email, firstName, lastName, role, phone, address, birthDate, isActive, createdAt FROM users';
  let params = [];
  let conditions = [];
  
  if (role) {
    conditions.push('role = ?');
    params.push(role);
  }
  
  if (isActive !== undefined) {
    conditions.push('isActive = ?');
    params.push(isActive === 'true' ? 1 : 0);
  }
  
  if (search) {
    conditions.push('(firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY lastName, firstName';
  
  database.all(query, params, (err, users) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      return res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de récupérer les utilisateurs'
      });
    }
    
    res.json({
      message: 'Utilisateurs récupérés avec succès',
      count: users.length,
      users
    });
  });
});

// GET /api/users/:id - Récupérer un utilisateur spécifique
router.get('/:id', canAccessOwnData, (req, res) => {
  const userId = parseInt(req.params.id);
  const database = getDatabase();
  
  database.get(
    'SELECT id, email, firstName, lastName, role, phone, address, birthDate, isActive, createdAt, updatedAt FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        return res.status(500).json({
          error: 'Erreur serveur',
          message: 'Impossible de récupérer l\'utilisateur'
        });
      }
      
      if (!user) {
        return res.status(404).json({
          error: 'Utilisateur non trouvé',
          message: 'L\'utilisateur spécifié n\'existe pas'
        });
      }
      
      res.json({
        message: 'Utilisateur récupéré avec succès',
        user
      });
    }
  );
});

// POST /api/users - Créer un nouvel utilisateur (admin seulement)
router.post('/', requireAdmin, userValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { email, firstName, lastName, role, phone, address, birthDate } = req.body;
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

        // Créer l'utilisateur (sans mot de passe, il sera défini plus tard)
        database.run(
          `INSERT INTO users (email, firstName, lastName, role, phone, address, birthDate)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [email, firstName, lastName, role, phone || null, address || null, birthDate || null],
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
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la création de l\'utilisateur'
    });
  }
});

// PUT /api/users/:id - Mettre à jour un utilisateur
router.put('/:id', canAccessOwnData, userValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array()
    });
  }

  const userId = parseInt(req.params.id);
  const { firstName, lastName, phone, address, birthDate } = req.body;
  const database = getDatabase();

  // Vérifier si l'utilisateur existe
  database.get(
    'SELECT id FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        console.error('Erreur de base de données:', err);
        return res.status(500).json({
          error: 'Erreur serveur',
          message: 'Impossible de vérifier l\'existence de l\'utilisateur'
        });
      }

      if (!user) {
        return res.status(404).json({
          error: 'Utilisateur non trouvé',
          message: 'L\'utilisateur spécifié n\'existe pas'
        });
      }

      // Mettre à jour l'utilisateur
      database.run(
        `UPDATE users 
         SET firstName = ?, lastName = ?, phone = ?, address = ?, birthDate = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [firstName, lastName, phone || null, address || null, birthDate || null, userId],
        function(err) {
          if (err) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
            return res.status(500).json({
              error: 'Erreur serveur',
              message: 'Impossible de mettre à jour l\'utilisateur'
            });
          }

          // Récupérer l'utilisateur mis à jour
          database.get(
            'SELECT id, email, firstName, lastName, role, phone, address, birthDate, isActive, createdAt, updatedAt FROM users WHERE id = ?',
            [userId],
            (err, updatedUser) => {
              if (err) {
                console.error('Erreur lors de la récupération de l\'utilisateur:', err);
                return res.status(500).json({
                  error: 'Erreur serveur',
                  message: 'Utilisateur mis à jour mais impossible de récupérer les informations'
                });
              }

              res.json({
                message: 'Utilisateur mis à jour avec succès',
                user: updatedUser
              });
            }
          );
        }
      );
    }
  );
});

// DELETE /api/users/:id - Désactiver un utilisateur (admin seulement)
router.delete('/:id', requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  const database = getDatabase();

  // Vérifier si l'utilisateur existe
  database.get(
    'SELECT id, role FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        console.error('Erreur de base de données:', err);
        return res.status(500).json({
          error: 'Erreur serveur',
          message: 'Impossible de vérifier l\'existence de l\'utilisateur'
        });
      }

      if (!user) {
        return res.status(404).json({
          error: 'Utilisateur non trouvé',
          message: 'L\'utilisateur spécifié n\'existe pas'
        });
      }

      // Empêcher la suppression de l'administrateur principal
      if (user.role === 'admin' && userId === 1) {
        return res.status(400).json({
          error: 'Suppression interdite',
          message: 'Impossible de supprimer l\'administrateur principal'
        });
      }

      // Désactiver l'utilisateur (soft delete)
      database.run(
        'UPDATE users SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [userId],
        function(err) {
          if (err) {
            console.error('Erreur lors de la désactivation de l\'utilisateur:', err);
            return res.status(500).json({
              error: 'Erreur serveur',
              message: 'Impossible de désactiver l\'utilisateur'
            });
          }

          res.json({
            message: 'Utilisateur désactivé avec succès'
          });
        }
      );
    }
  );
});

// GET /api/users/:id/profile - Récupérer le profil complet d'un utilisateur
router.get('/:id/profile', canAccessOwnData, (req, res) => {
  const userId = parseInt(req.params.id);
  const database = getDatabase();
  
  // Récupérer les informations de base de l'utilisateur
  database.get(
    'SELECT id, email, firstName, lastName, role, phone, address, birthDate, isActive, createdAt, updatedAt FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        console.error('Erreur lors de la récupération du profil:', err);
        return res.status(500).json({
          error: 'Erreur serveur',
          message: 'Impossible de récupérer le profil'
        });
      }
      
      if (!user) {
        return res.status(404).json({
          error: 'Utilisateur non trouvé',
          message: 'L\'utilisateur spécifié n\'existe pas'
        });
      }

      // Récupérer les informations supplémentaires selon le rôle
      if (user.role === 'student') {
        // Récupérer les classes de l'étudiant
        database.all(
          `SELECT c.*, sc.enrollmentDate 
           FROM classes c 
           JOIN student_class sc ON c.id = sc.classId 
           WHERE sc.studentId = ? AND sc.isActive = 1`,
          [userId],
          (err, classes) => {
            if (err) {
              console.error('Erreur lors de la récupération des classes:', err);
            }
            
            res.json({
              message: 'Profil récupéré avec succès',
              user: {
                ...user,
                classes: classes || []
              }
            });
          }
        );
      } else if (user.role === 'teacher') {
        // Récupérer les classes enseignées par l'enseignant
        database.all(
          `SELECT DISTINCT c.* 
           FROM classes c 
           JOIN courses co ON c.id = co.classId 
           WHERE co.teacherId = ? AND co.isActive = 1`,
          [userId],
          (err, classes) => {
            if (err) {
              console.error('Erreur lors de la récupération des classes enseignées:', err);
            }
            
            res.json({
              message: 'Profil récupéré avec succès',
              user: {
                ...user,
                teachingClasses: classes || []
              }
            });
          }
        );
      } else {
        // Admin - pas d'informations supplémentaires nécessaires
        res.json({
          message: 'Profil récupéré avec succès',
          user
        });
      }
    }
  );
});

module.exports = router;
