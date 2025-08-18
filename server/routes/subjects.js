const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../config/database');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation pour la création/modification de matière
const subjectValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Le nom de la matière doit contenir au moins 2 caractères'),
  body('code').trim().isLength({ min: 2, max: 10 }).withMessage('Le code doit contenir entre 2 et 10 caractères'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('La description ne peut pas dépasser 500 caractères'),
  body('credits').optional().isInt({ min: 1, max: 10 }).withMessage('Les crédits doivent être entre 1 et 10')
];

// GET /api/subjects - Récupérer toutes les matières
router.get('/', (req, res) => {
  const database = getDatabase();
  const { isActive, search } = req.query;
  
  let query = 'SELECT * FROM subjects';
  let params = [];
  let conditions = [];
  
  if (isActive !== undefined) {
    conditions.push('isActive = ?');
    params.push(isActive === 'true' ? 1 : 0);
  }
  
  if (search) {
    conditions.push('(name LIKE ? OR code LIKE ? OR description LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY name';
  
  database.all(query, params, (err, subjects) => {
    if (err) {
      console.error('Erreur lors de la récupération des matières:', err);
      return res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de récupérer les matières'
      });
    }
    
    res.json({
      message: 'Matières récupérées avec succès',
      count: subjects.length,
      subjects
    });
  });
});

// GET /api/subjects/:id - Récupérer une matière spécifique
router.get('/:id', (req, res) => {
  const subjectId = parseInt(req.params.id);
  const database = getDatabase();
  
  database.get(
    'SELECT * FROM subjects WHERE id = ?',
    [subjectId],
    (err, subject) => {
      if (err) {
        console.error('Erreur lors de la récupération de la matière:', err);
        return res.status(500).json({
          error: 'Erreur serveur',
          message: 'Impossible de récupérer la matière'
        });
      }
      
      if (!subject) {
        return res.status(404).json({
          error: 'Matière non trouvée',
          message: 'La matière spécifiée n\'existe pas'
        });
      }
      
      res.json({
        message: 'Matière récupérée avec succès',
        subject
      });
    }
  );
});

// POST /api/subjects - Créer une nouvelle matière (admin seulement)
router.post('/', requireAdmin, subjectValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array()
    });
  }

  const { name, code, description, credits } = req.body;
  const database = getDatabase();

  // Vérifier si le code existe déjà
  database.get(
    'SELECT id FROM subjects WHERE code = ?',
    [code],
    (err, existingSubject) => {
      if (err) {
        console.error('Erreur de base de données:', err);
        return res.status(500).json({
          error: 'Erreur serveur',
          message: 'Impossible de vérifier le code de la matière'
        });
      }

      if (existingSubject) {
        return res.status(400).json({
          error: 'Code déjà utilisé',
          message: 'Une matière avec ce code existe déjà'
        });
      }

      // Créer la matière
      database.run(
        `INSERT INTO subjects (name, code, description, credits)
         VALUES (?, ?, ?, ?)`,
        [name, code, description || null, credits || 1],
        function(err) {
          if (err) {
            console.error('Erreur lors de la création de la matière:', err);
            return res.status(500).json({
              error: 'Erreur serveur',
              message: 'Impossible de créer la matière'
            });
          }

          // Récupérer la matière créée
          database.get(
            'SELECT * FROM subjects WHERE id = ?',
            [this.lastID],
            (err, newSubject) => {
              if (err) {
                console.error('Erreur lors de la récupération de la matière:', err);
                return res.status(500).json({
                  error: 'Erreur serveur',
                  message: 'Matière créée mais impossible de récupérer les informations'
                });
              }

              res.status(201).json({
                message: 'Matière créée avec succès',
                subject: newSubject
              });
            }
          );
        }
      );
    }
  );
});

// PUT /api/subjects/:id - Mettre à jour une matière (admin seulement)
router.put('/:id', requireAdmin, subjectValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array()
    });
  }

  const subjectId = parseInt(req.params.id);
  const { name, code, description, credits } = req.body;
  const database = getDatabase();

  // Vérifier si la matière existe
  database.get(
    'SELECT id FROM subjects WHERE id = ?',
    [subjectId],
    (err, subject) => {
      if (err) {
        console.error('Erreur de base de données:', err);
        return res.status(500).json({
          error: 'Erreur serveur',
          message: 'Impossible de vérifier l\'existence de la matière'
        });
      }

      if (!subject) {
        return res.status(404).json({
          error: 'Matière non trouvée',
          message: 'La matière spécifiée n\'existe pas'
        });
      }

      // Vérifier si le nouveau code existe déjà (sauf pour la matière actuelle)
      database.get(
        'SELECT id FROM subjects WHERE code = ? AND id != ?',
        [code, subjectId],
        (err, existingSubject) => {
          if (err) {
            console.error('Erreur de base de données:', err);
            return res.status(500).json({
              error: 'Erreur serveur',
              message: 'Impossible de vérifier le code de la matière'
            });
          }

          if (existingSubject) {
            return res.status(400).json({
              error: 'Code déjà utilisé',
              message: 'Une autre matière utilise déjà ce code'
            });
          }

          // Mettre à jour la matière
          database.run(
            `UPDATE subjects 
             SET name = ?, code = ?, description = ?, credits = ?, updatedAt = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [name, code, description || null, credits || 1, subjectId],
            function(err) {
              if (err) {
                console.error('Erreur lors de la mise à jour de la matière:', err);
                return res.status(500).json({
                  error: 'Erreur serveur',
                  message: 'Impossible de mettre à jour la matière'
                });
              }

              // Récupérer la matière mise à jour
              database.get(
                'SELECT * FROM subjects WHERE id = ?',
                [subjectId],
                (err, updatedSubject) => {
                  if (err) {
                    console.error('Erreur lors de la récupération de la matière:', err);
                    return res.status(500).json({
                      error: 'Erreur serveur',
                      message: 'Matière mise à jour mais impossible de récupérer les informations'
                    });
                  }

                  res.json({
                    message: 'Matière mise à jour avec succès',
                    subject: updatedSubject
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// DELETE /api/subjects/:id - Désactiver une matière (admin seulement)
router.delete('/:id', requireAdmin, (req, res) => {
  const subjectId = parseInt(req.params.id);
  const database = getDatabase();

  // Vérifier si la matière existe
  database.get(
    'SELECT id FROM subjects WHERE id = ?',
    [subjectId],
    (err, subject) => {
      if (err) {
        console.error('Erreur de base de données:', err);
        return res.status(500).json({
          error: 'Erreur serveur',
          message: 'Impossible de vérifier l\'existence de la matière'
        });
      }

      if (!subject) {
        return res.status(404).json({
          error: 'Matière non trouvée',
          message: 'La matière spécifiée n\'existe pas'
        });
      }

      // Vérifier si la matière est utilisée dans des cours
      database.get(
        'SELECT id FROM courses WHERE subjectId = ? AND isActive = 1',
        [subjectId],
        (err, course) => {
          if (err) {
            console.error('Erreur lors de la vérification des cours:', err);
            return res.status(500).json({
              error: 'Erreur serveur',
              message: 'Impossible de vérifier l\'utilisation de la matière'
            });
          }

          if (course) {
            return res.status(400).json({
              error: 'Matière utilisée',
              message: 'Cette matière ne peut pas être supprimée car elle est utilisée dans des cours'
            });
          }

          // Désactiver la matière (soft delete)
          database.run(
            'UPDATE subjects SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [subjectId],
            function(err) {
              if (err) {
                console.error('Erreur lors de la désactivation de la matière:', err);
                return res.status(500).json({
                  error: 'Erreur serveur',
                  message: 'Impossible de désactiver la matière'
                });
              }

              res.json({
                message: 'Matière désactivée avec succès'
              });
            }
          );
        }
      );
    }
  );
});

// GET /api/subjects/:id/courses - Récupérer les cours d'une matière
router.get('/:id/courses', (req, res) => {
  const subjectId = parseInt(req.params.id);
  const database = getDatabase();
  
  const query = `
    SELECT co.*, c.name as className, c.level as classLevel, c.field as classField,
           u.firstName as teacherFirstName, u.lastName as teacherLastName
    FROM courses co
    JOIN classes c ON co.classId = c.id
    JOIN users u ON co.teacherId = u.id
    WHERE co.subjectId = ? AND co.isActive = 1
    ORDER BY c.level, c.name, co.dayOfWeek, co.startTime
  `;
  
  database.all(query, [subjectId], (err, courses) => {
    if (err) {
      console.error('Erreur lors de la récupération des cours:', err);
      return res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de récupérer les cours de la matière'
      });
    }
    
    res.json({
      message: 'Cours de la matière récupérés avec succès',
      count: courses.length,
      courses
    });
  });
});

// GET /api/subjects/:id/teachers - Récupérer les enseignants d'une matière
router.get('/:id/teachers', (req, res) => {
  const subjectId = parseInt(req.params.id);
  const database = getDatabase();
  
  const query = `
    SELECT DISTINCT u.id, u.firstName, u.lastName, u.email, u.phone
    FROM users u
    JOIN courses co ON u.id = co.teacherId
    WHERE co.subjectId = ? AND co.isActive = 1 AND u.role = 'teacher' AND u.isActive = 1
    ORDER BY u.lastName, u.firstName
  `;
  
  database.all(query, [subjectId], (err, teachers) => {
    if (err) {
      console.error('Erreur lors de la récupération des enseignants:', err);
      return res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de récupérer les enseignants de la matière'
      });
    }
    
    res.json({
      message: 'Enseignants de la matière récupérés avec succès',
      count: teachers.length,
      teachers
    });
  });
});

module.exports = router;
