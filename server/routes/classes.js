const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../config/database');
const { requireAdmin, canAccessClassData } = require('../middleware/auth');

const router = express.Router();

// Validation pour la création/modification de classe
const classValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Le nom de la classe doit contenir au moins 2 caractères'),
  body('level').trim().isLength({ min: 1 }).withMessage('Le niveau est requis'),
  body('field').trim().isLength({ min: 2 }).withMessage('La filière doit contenir au moins 2 caractères'),
  body('capacity').isInt({ min: 1, max: 100 }).withMessage('La capacité doit être entre 1 et 100'),
  body('academicYear').trim().isLength({ min: 4 }).withMessage('L\'année académique est requise'),
  body('headTeacherId').optional().isInt({ min: 1 }).withMessage('L\'ID du professeur principal doit être un entier positif'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('La description ne peut pas dépasser 500 caractères')
];

// GET /api/classes - Récupérer toutes les classes
router.get('/', (req, res) => {
  const database = getDatabase();
  const { level, field, academicYear, isActive, search } = req.query;
  
  let query = `
    SELECT c.*, 
           u.firstName as headTeacherFirstName, 
           u.lastName as headTeacherLastName,
           COUNT(sc.studentId) as currentEnrollment
    FROM classes c
    LEFT JOIN users u ON c.headTeacherId = u.id
    LEFT JOIN student_class sc ON c.id = sc.classId AND sc.isActive = 1
  `;
  
  let params = [];
  let conditions = [];
  
  if (level) {
    conditions.push('c.level = ?');
    params.push(level);
  }
  
  if (field) {
    conditions.push('c.field = ?');
    params.push(field);
  }
  
  if (academicYear) {
    conditions.push('c.academicYear = ?');
    params.push(academicYear);
  }
  
  if (isActive !== undefined) {
    conditions.push('c.isActive = ?');
    params.push(isActive === 'true' ? 1 : 0);
  }
  
  if (search) {
    conditions.push('(c.name LIKE ? OR c.field LIKE ? OR c.level LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' GROUP BY c.id ORDER BY c.level, c.name';
  
  database.all(query, params, (err, classes) => {
    if (err) {
      console.error('Erreur lors de la récupération des classes:', err);
      return res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de récupérer les classes'
      });
    }
    
    res.json({
      message: 'Classes récupérées avec succès',
      count: classes.length,
      classes
    });
  });
});

// GET /api/classes/:id - Récupérer une classe spécifique
router.get('/:id', (req, res) => {
  const classId = parseInt(req.params.id);
  const database = getDatabase();
  
  const query = `
    SELECT c.*, 
           u.firstName as headTeacherFirstName, 
           u.lastName as headTeacherLastName,
           COUNT(sc.studentId) as currentEnrollment
    FROM classes c
    LEFT JOIN users u ON c.headTeacherId = u.id
    LEFT JOIN student_class sc ON c.id = sc.classId AND sc.isActive = 1
    WHERE c.id = ?
    GROUP BY c.id
  `;
  
  database.get(query, [classId], (err, classData) => {
    if (err) {
      console.error('Erreur lors de la récupération de la classe:', err);
      return res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de récupérer la classe'
      });
    }
    
    if (!classData) {
      return res.status(404).json({
        error: 'Classe non trouvée',
        message: 'La classe spécifiée n\'existe pas'
      });
    }
    
    res.json({
      message: 'Classe récupérée avec succès',
      class: classData
    });
  });
});

// POST /api/classes - Créer une nouvelle classe (admin seulement)
router.post('/', requireAdmin, classValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array()
    });
  }

  const { name, level, field, capacity, academicYear, headTeacherId, description } = req.body;
  const database = getDatabase();

  // Vérifier si le professeur principal existe et est un enseignant
  if (headTeacherId) {
    database.get(
      'SELECT id, role FROM users WHERE id = ? AND role = "teacher" AND isActive = 1',
      [headTeacherId],
      (err, teacher) => {
        if (err) {
          console.error('Erreur lors de la vérification du professeur:', err);
          return res.status(500).json({
            error: 'Erreur serveur',
            message: 'Impossible de vérifier le professeur principal'
          });
        }

        if (!teacher) {
          return res.status(400).json({
            error: 'Professeur invalide',
            message: 'Le professeur principal spécifié n\'existe pas ou n\'est pas un enseignant'
          });
        }

        createClass();
      }
    );
  } else {
    createClass();
  }

  function createClass() {
    database.run(
      `INSERT INTO classes (name, level, field, capacity, academicYear, headTeacherId, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, level, field, capacity, academicYear, headTeacherId || null, description || null],
      function(err) {
        if (err) {
          console.error('Erreur lors de la création de la classe:', err);
          return res.status(500).json({
            error: 'Erreur serveur',
            message: 'Impossible de créer la classe'
          });
        }

        // Récupérer la classe créée
        database.get(
          'SELECT * FROM classes WHERE id = ?',
          [this.lastID],
          (err, newClass) => {
            if (err) {
              console.error('Erreur lors de la récupération de la classe:', err);
              return res.status(500).json({
                error: 'Erreur serveur',
                message: 'Classe créée mais impossible de récupérer les informations'
              });
            }

            res.status(201).json({
              message: 'Classe créée avec succès',
              class: newClass
            });
          }
        );
      }
    );
  }
});

// PUT /api/classes/:id - Mettre à jour une classe (admin seulement)
router.put('/:id', requireAdmin, classValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array()
    });
  }

  const classId = parseInt(req.params.id);
  const { name, level, field, capacity, academicYear, headTeacherId, description } = req.body;
  const database = getDatabase();

  // Vérifier si la classe existe
  database.get(
    'SELECT id FROM classes WHERE id = ?',
    [classId],
    (err, classData) => {
      if (err) {
        console.error('Erreur de base de données:', err);
        return res.status(500).json({
          error: 'Erreur serveur',
          message: 'Impossible de vérifier l\'existence de la classe'
        });
      }

      if (!classData) {
        return res.status(404).json({
          error: 'Classe non trouvée',
          message: 'La classe spécifiée n\'existe pas'
        });
      }

      // Vérifier si le professeur principal existe et est un enseignant
      if (headTeacherId) {
        database.get(
          'SELECT id, role FROM users WHERE id = ? AND role = "teacher" AND isActive = 1',
          [headTeacherId],
          (err, teacher) => {
            if (err) {
              console.error('Erreur lors de la vérification du professeur:', err);
              return res.status(500).json({
                error: 'Erreur serveur',
                message: 'Impossible de vérifier le professeur principal'
              });
            }

            if (!teacher) {
              return res.status(400).json({
                error: 'Professeur invalide',
                message: 'Le professeur principal spécifié n\'existe pas ou n\'est pas un enseignant'
              });
            }

            updateClass();
          }
        );
      } else {
        updateClass();
      }

      function updateClass() {
        database.run(
          `UPDATE classes 
           SET name = ?, level = ?, field = ?, capacity = ?, academicYear = ?, 
               headTeacherId = ?, description = ?, updatedAt = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [name, level, field, capacity, academicYear, headTeacherId || null, description || null, classId],
          function(err) {
            if (err) {
              console.error('Erreur lors de la mise à jour de la classe:', err);
              return res.status(500).json({
                error: 'Erreur serveur',
                message: 'Impossible de mettre à jour la classe'
              });
            }

            // Récupérer la classe mise à jour
            database.get(
              'SELECT * FROM classes WHERE id = ?',
              [classId],
              (err, updatedClass) => {
                if (err) {
                  console.error('Erreur lors de la récupération de la classe:', err);
                  return res.status(500).json({
                    error: 'Erreur serveur',
                    message: 'Classe mise à jour mais impossible de récupérer les informations'
                  });
                }

                res.json({
                  message: 'Classe mise à jour avec succès',
                  class: updatedClass
                });
              }
            );
          }
        );
      }
    }
  );
});

// DELETE /api/classes/:id - Désactiver une classe (admin seulement)
router.delete('/:id', requireAdmin, (req, res) => {
  const classId = parseInt(req.params.id);
  const database = getDatabase();

  // Vérifier si la classe existe
  database.get(
    'SELECT id FROM classes WHERE id = ?',
    [classId],
    (err, classData) => {
      if (err) {
        console.error('Erreur de base de données:', err);
        return res.status(500).json({
          error: 'Erreur serveur',
          message: 'Impossible de vérifier l\'existence de la classe'
        });
      }

      if (!classData) {
        return res.status(404).json({
          error: 'Classe non trouvée',
          message: 'La classe spécifiée n\'existe pas'
        });
      }

      // Désactiver la classe (soft delete)
      database.run(
        'UPDATE classes SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [classId],
        function(err) {
          if (err) {
            console.error('Erreur lors de la désactivation de la classe:', err);
            return res.status(500).json({
              error: 'Erreur serveur',
              message: 'Impossible de désactiver la classe'
            });
          }

          res.json({
            message: 'Classe désactivée avec succès'
          });
        }
      );
    }
  );
});

// GET /api/classes/:id/students - Récupérer les étudiants d'une classe
router.get('/:id/students', canAccessClassData, (req, res) => {
  const classId = parseInt(req.params.id);
  const database = getDatabase();
  
  const query = `
    SELECT u.id, u.firstName, u.lastName, u.email, u.phone, u.birthDate,
           sc.enrollmentDate, sc.isActive
    FROM users u
    JOIN student_class sc ON u.id = sc.studentId
    WHERE sc.classId = ? AND sc.isActive = 1 AND u.isActive = 1
    ORDER BY u.lastName, u.firstName
  `;
  
  database.all(query, [classId], (err, students) => {
    if (err) {
      console.error('Erreur lors de la récupération des étudiants:', err);
      return res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de récupérer les étudiants de la classe'
      });
    }
    
    res.json({
      message: 'Étudiants de la classe récupérés avec succès',
      count: students.length,
      students
    });
  });
});

// GET /api/classes/:id/courses - Récupérer les cours d'une classe
router.get('/:id/courses', canAccessClassData, (req, res) => {
  const classId = parseInt(req.params.id);
  const database = getDatabase();
  
  const query = `
    SELECT co.*, s.name as subjectName, s.code as subjectCode,
           u.firstName as teacherFirstName, u.lastName as teacherLastName
    FROM courses co
    JOIN subjects s ON co.subjectId = s.id
    JOIN users u ON co.teacherId = u.id
    WHERE co.classId = ? AND co.isActive = 1
    ORDER BY 
      CASE co.dayOfWeek 
        WHEN 'monday' THEN 1
        WHEN 'tuesday' THEN 2
        WHEN 'wednesday' THEN 3
        WHEN 'thursday' THEN 4
        WHEN 'friday' THEN 5
        WHEN 'saturday' THEN 6
        ELSE 7
      END,
      co.startTime
  `;
  
  database.all(query, [classId], (err, courses) => {
    if (err) {
      console.error('Erreur lors de la récupération des cours:', err);
      return res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de récupérer les cours de la classe'
      });
    }
    
    res.json({
      message: 'Cours de la classe récupérés avec succès',
      count: courses.length,
      courses
    });
  });
});

// POST /api/classes/:id/enroll - Inscrire un étudiant dans une classe
router.post('/:id/enroll', requireAdmin, [
  body('studentId').isInt({ min: 1 }).withMessage('L\'ID de l\'étudiant est requis'),
  body('academicYear').trim().isLength({ min: 4 }).withMessage('L\'année académique est requise')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array()
    });
  }

  const classId = parseInt(req.params.id);
  const { studentId, academicYear } = req.body;
  const database = getDatabase();

  // Vérifier si l'étudiant existe et est actif
  database.get(
    'SELECT id, role FROM users WHERE id = ? AND role = "student" AND isActive = 1',
    [studentId],
    (err, student) => {
      if (err) {
        console.error('Erreur lors de la vérification de l\'étudiant:', err);
        return res.status(500).json({
          error: 'Erreur serveur',
          message: 'Impossible de vérifier l\'étudiant'
        });
      }

      if (!student) {
        return res.status(400).json({
          error: 'Étudiant invalide',
          message: 'L\'étudiant spécifié n\'existe pas ou n\'est pas un étudiant'
        });
      }

      // Vérifier si l'inscription existe déjà
      database.get(
        'SELECT id FROM student_class WHERE studentId = ? AND classId = ? AND academicYear = ?',
        [studentId, classId, academicYear],
        (err, existingEnrollment) => {
          if (err) {
            console.error('Erreur lors de la vérification de l\'inscription:', err);
            return res.status(500).json({
              error: 'Erreur serveur',
              message: 'Impossible de vérifier l\'inscription existante'
            });
          }

          if (existingEnrollment) {
            return res.status(400).json({
              error: 'Inscription existante',
              message: 'L\'étudiant est déjà inscrit dans cette classe pour cette année'
            });
          }

          // Créer l'inscription
          database.run(
            'INSERT INTO student_class (studentId, classId, academicYear) VALUES (?, ?, ?)',
            [studentId, classId, academicYear],
            function(err) {
              if (err) {
                console.error('Erreur lors de l\'inscription:', err);
                return res.status(500).json({
                  error: 'Erreur serveur',
                  message: 'Impossible d\'inscrire l\'étudiant'
                });
              }

              res.status(201).json({
                message: 'Étudiant inscrit avec succès dans la classe'
              });
            }
          );
        }
      );
    }
  );
});

module.exports = router;
