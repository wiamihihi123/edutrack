const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../config/database');

// Validation pour la création/modification de notes
const gradeValidation = [
  body('studentId').isInt().withMessage('ID d\'étudiant invalide'),
  body('subjectId').isInt().withMessage('ID de matière invalide'),
  body('classId').isInt().withMessage('ID de classe invalide'),
  body('examType').isIn(['quiz', 'midterm', 'final', 'assignment']).withMessage('Type d\'examen invalide'),
  body('score').isFloat({ min: 0, max: 20 }).withMessage('Note doit être entre 0 et 20'),
  body('maxScore').optional().isFloat({ min: 0 }).withMessage('Score maximum invalide'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Poids invalide'),
  body('examDate').optional().isISO8601().withMessage('Date d\'examen invalide'),
  body('comments').optional().trim().isLength({ max: 500 }).withMessage('Commentaires trop longs')
];

// GET /api/grades - Récupérer toutes les notes avec filtres
router.get('/', async (req, res) => {
  try {
    const database = getDatabase();
    const { studentId, subjectId, classId, examType, startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        g.*,
        u.firstName as studentFirstName,
        u.lastName as studentLastName,
        s.name as subjectName,
        s.code as subjectCode,
        cl.name as className,
        cl.level as classLevel,
        t.firstName as teacherFirstName,
        t.lastName as teacherLastName
      FROM grades g
      JOIN users u ON g.studentId = u.id
      JOIN subjects s ON g.subjectId = s.id
      JOIN classes cl ON g.classId = cl.id
      JOIN users t ON g.recordedBy = t.id
      WHERE g.score IS NOT NULL
    `;
    
    const params = [];
    
    if (studentId) {
      query += ' AND g.studentId = ?';
      params.push(studentId);
    }
    
    if (subjectId) {
      query += ' AND g.subjectId = ?';
      params.push(subjectId);
    }
    
    if (classId) {
      query += ' AND g.classId = ?';
      params.push(classId);
    }
    
    if (examType) {
      query += ' AND g.examType = ?';
      params.push(examType);
    }
    
    if (startDate) {
      query += ' AND g.examDate >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND g.examDate <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY g.examDate DESC, g.createdAt DESC';
    
    database.all(query, params, (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des notes:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.json(rows);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/grades/:id - Récupérer une note spécifique
router.get('/:id', async (req, res) => {
  try {
    const database = getDatabase();
    const { id } = req.params;
    
    database.get(`
      SELECT 
        g.*,
        u.firstName as studentFirstName,
        u.lastName as studentLastName,
        s.name as subjectName,
        s.code as subjectCode,
        cl.name as className,
        cl.level as classLevel,
        t.firstName as teacherFirstName,
        t.lastName as teacherLastName
      FROM grades g
      JOIN users u ON g.studentId = u.id
      JOIN subjects s ON g.subjectId = s.id
      JOIN classes cl ON g.classId = cl.id
      JOIN users t ON g.recordedBy = t.id
      WHERE g.id = ?
    `, [id], (err, row) => {
      if (err) {
        console.error('Erreur lors de la récupération de la note:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Note non trouvée' });
      }
      
      res.json(row);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/grades - Créer une nouvelle note
router.post('/', gradeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const database = getDatabase();
    const { studentId, subjectId, classId, examType, score, maxScore = 20, weight = 1.0, examDate, comments } = req.body;
    const recordedBy = req.user.id; // Récupéré du middleware d'authentification
    
    // Vérifier si l'étudiant est inscrit dans la classe
    const enrollmentCheck = await new Promise((resolve, reject) => {
      database.get(`
        SELECT COUNT(*) as count FROM student_class 
        WHERE studentId = ? AND classId = ? AND isActive = 1
      `, [studentId, classId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (enrollmentCheck.count === 0) {
      return res.status(400).json({ error: 'L\'étudiant n\'est pas inscrit dans cette classe' });
    }
    
    // Vérifier si une note existe déjà pour cet étudiant, matière, classe et type d'examen
    const existingGradeCheck = await new Promise((resolve, reject) => {
      database.get(`
        SELECT id FROM grades 
        WHERE studentId = ? AND subjectId = ? AND classId = ? AND examType = ? AND examDate = ?
      `, [studentId, subjectId, classId, examType, examDate], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (existingGradeCheck) {
      return res.status(400).json({ error: 'Une note existe déjà pour cet étudiant, matière et type d\'examen à cette date' });
    }
    
    database.run(`
      INSERT INTO grades (studentId, subjectId, classId, examType, score, maxScore, weight, examDate, comments, recordedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [studentId, subjectId, classId, examType, score, maxScore, weight, examDate, comments, recordedBy], function(err) {
      if (err) {
        console.error('Erreur lors de la création de la note:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.status(201).json({
        id: this.lastID,
        message: 'Note créée avec succès'
      });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/grades/:id - Modifier une note
router.put('/:id', gradeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const database = getDatabase();
    const { id } = req.params;
    const { score, maxScore, weight, examDate, comments } = req.body;
    
    database.run(`
      UPDATE grades 
      SET score = ?, maxScore = ?, weight = ?, examDate = ?, comments = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [score, maxScore, weight, examDate, comments, id], function(err) {
      if (err) {
        console.error('Erreur lors de la modification de la note:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Note non trouvée' });
      }
      
      res.json({ message: 'Note modifiée avec succès' });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/grades/:id - Supprimer une note
router.delete('/:id', async (req, res) => {
  try {
    const database = getDatabase();
    const { id } = req.params;
    
    database.run(`
      DELETE FROM grades WHERE id = ?
    `, [id], function(err) {
      if (err) {
        console.error('Erreur lors de la suppression de la note:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Note non trouvée' });
      }
      
      res.json({ message: 'Note supprimée avec succès' });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/grades/student/:studentId - Notes d'un étudiant
router.get('/student/:studentId', async (req, res) => {
  try {
    const database = getDatabase();
    const { studentId } = req.params;
    const { subjectId, classId, examType } = req.query;
    
    let query = `
      SELECT 
        g.*,
        s.name as subjectName,
        s.code as subjectCode,
        cl.name as className,
        cl.level as classLevel
      FROM grades g
      JOIN subjects s ON g.subjectId = s.id
      JOIN classes cl ON g.classId = cl.id
      WHERE g.studentId = ? AND g.score IS NOT NULL
    `;
    
    const params = [studentId];
    
    if (subjectId) {
      query += ' AND g.subjectId = ?';
      params.push(subjectId);
    }
    
    if (classId) {
      query += ' AND g.classId = ?';
      params.push(classId);
    }
    
    if (examType) {
      query += ' AND g.examType = ?';
      params.push(examType);
    }
    
    query += ' ORDER BY g.examDate DESC, g.createdAt DESC';
    
    database.all(query, params, (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des notes de l\'étudiant:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.json(rows);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/grades/class/:classId - Notes d'une classe
router.get('/class/:classId', async (req, res) => {
  try {
    const database = getDatabase();
    const { classId } = req.params;
    const { subjectId, examType } = req.query;
    
    let query = `
      SELECT 
        g.*,
        u.firstName as studentFirstName,
        u.lastName as studentLastName,
        s.name as subjectName,
        s.code as subjectCode
      FROM grades g
      JOIN users u ON g.studentId = u.id
      JOIN subjects s ON g.subjectId = s.id
      WHERE g.classId = ? AND g.score IS NOT NULL
    `;
    
    const params = [classId];
    
    if (subjectId) {
      query += ' AND g.subjectId = ?';
      params.push(subjectId);
    }
    
    if (examType) {
      query += ' AND g.examType = ?';
      params.push(examType);
    }
    
    query += ' ORDER BY u.lastName, u.firstName, g.examDate DESC';
    
    database.all(query, params, (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des notes de la classe:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.json(rows);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/grades/statistics/:classId - Statistiques des notes d'une classe
router.get('/statistics/:classId', async (req, res) => {
  try {
    const database = getDatabase();
    const { classId } = req.params;
    const { subjectId } = req.query;
    
    let query = `
      SELECT 
        s.name as subjectName,
        s.code as subjectCode,
        COUNT(g.id) as totalGrades,
        AVG(g.score) as averageScore,
        MIN(g.score) as minScore,
        MAX(g.score) as maxScore,
        SUM(CASE WHEN g.score >= 10 THEN 1 ELSE 0 END) as passingGrades,
        SUM(CASE WHEN g.score < 10 THEN 1 ELSE 0 END) as failingGrades
      FROM grades g
      JOIN subjects s ON g.subjectId = s.id
      WHERE g.classId = ? AND g.score IS NOT NULL
    `;
    
    const params = [classId];
    
    if (subjectId) {
      query += ' AND g.subjectId = ?';
      params.push(subjectId);
    }
    
    query += ' GROUP BY g.subjectId ORDER BY s.name';
    
    database.all(query, params, (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des statistiques:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      // Calculer les pourcentages
      rows.forEach(row => {
        row.passingPercentage = row.totalGrades > 0 ? (row.passingGrades / row.totalGrades * 100).toFixed(2) : 0;
        row.failingPercentage = row.totalGrades > 0 ? (row.failingGrades / row.totalGrades * 100).toFixed(2) : 0;
        row.averageScore = row.averageScore ? row.averageScore.toFixed(2) : 0;
      });
      
      res.json(rows);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
