const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../config/database');

// Validation pour la création/modification de présences
const attendanceValidation = [
  body('studentId').isInt().withMessage('ID d\'étudiant invalide'),
  body('courseId').isInt().withMessage('ID de cours invalide'),
  body('date').isISO8601().withMessage('Date invalide'),
  body('status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Statut invalide'),
  body('reason').optional().trim().isLength({ max: 200 }).withMessage('Raison trop longue')
];

// GET /api/attendance - Récupérer toutes les présences avec filtres
router.get('/', async (req, res) => {
  try {
    const database = getDatabase();
    const { studentId, courseId, classId, date, status, startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        a.*,
        u.firstName as studentFirstName,
        u.lastName as studentLastName,
        c.dayOfWeek,
        c.startTime,
        c.endTime,
        c.room,
        s.name as subjectName,
        s.code as subjectCode,
        cl.name as className,
        cl.level as classLevel,
        t.firstName as teacherFirstName,
        t.lastName as teacherLastName
      FROM attendance a
      JOIN users u ON a.studentId = u.id
      JOIN courses c ON a.courseId = c.id
      JOIN subjects s ON c.subjectId = s.id
      JOIN classes cl ON c.classId = cl.id
      JOIN users t ON c.teacherId = t.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (studentId) {
      query += ' AND a.studentId = ?';
      params.push(studentId);
    }
    
    if (courseId) {
      query += ' AND a.courseId = ?';
      params.push(courseId);
    }
    
    if (classId) {
      query += ' AND c.classId = ?';
      params.push(classId);
    }
    
    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }
    
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    
    if (startDate) {
      query += ' AND a.date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND a.date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY a.date DESC, c.startTime';
    
    database.all(query, params, (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des présences:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.json(rows);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/attendance/:id - Récupérer une présence spécifique
router.get('/:id', async (req, res) => {
  try {
    const database = getDatabase();
    const { id } = req.params;
    
    database.get(`
      SELECT 
        a.*,
        u.firstName as studentFirstName,
        u.lastName as studentLastName,
        c.dayOfWeek,
        c.startTime,
        c.endTime,
        c.room,
        s.name as subjectName,
        s.code as subjectCode,
        cl.name as className,
        cl.level as classLevel,
        t.firstName as teacherFirstName,
        t.lastName as teacherLastName
      FROM attendance a
      JOIN users u ON a.studentId = u.id
      JOIN courses c ON a.courseId = c.id
      JOIN subjects s ON c.subjectId = s.id
      JOIN classes cl ON c.classId = cl.id
      JOIN users t ON c.teacherId = t.id
      WHERE a.id = ?
    `, [id], (err, row) => {
      if (err) {
        console.error('Erreur lors de la récupération de la présence:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Présence non trouvée' });
      }
      
      res.json(row);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/attendance - Créer une nouvelle présence
router.post('/', attendanceValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const database = getDatabase();
    const { studentId, courseId, date, status, reason } = req.body;
    const recordedBy = req.user.id; // Récupéré du middleware d'authentification
    
    // Vérifier si l'étudiant est inscrit dans la classe du cours
    const enrollmentCheck = await new Promise((resolve, reject) => {
      database.get(`
        SELECT COUNT(*) as count FROM student_class sc
        JOIN courses c ON sc.classId = c.classId
        WHERE sc.studentId = ? AND c.id = ? AND sc.isActive = 1
      `, [studentId, courseId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (enrollmentCheck.count === 0) {
      return res.status(400).json({ error: 'L\'étudiant n\'est pas inscrit dans la classe de ce cours' });
    }
    
    // Vérifier si une présence existe déjà pour cet étudiant, cours et date
    const existingAttendanceCheck = await new Promise((resolve, reject) => {
      database.get(`
        SELECT id FROM attendance 
        WHERE studentId = ? AND courseId = ? AND date = ?
      `, [studentId, courseId, date], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (existingAttendanceCheck) {
      return res.status(400).json({ error: 'Une présence existe déjà pour cet étudiant, cours et date' });
    }
    
    database.run(`
      INSERT INTO attendance (studentId, courseId, date, status, reason, recordedBy)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [studentId, courseId, date, status, reason, recordedBy], function(err) {
      if (err) {
        console.error('Erreur lors de la création de la présence:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.status(201).json({
        id: this.lastID,
        message: 'Présence enregistrée avec succès'
      });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/attendance/bulk - Créer plusieurs présences en une fois
router.post('/bulk', [
  body('courseId').isInt().withMessage('ID de cours invalide'),
  body('date').isISO8601().withMessage('Date invalide'),
  body('attendances').isArray().withMessage('Liste des présences requise'),
  body('attendances.*.studentId').isInt().withMessage('ID d\'étudiant invalide'),
  body('attendances.*.status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Statut invalide'),
  body('attendances.*.reason').optional().trim().isLength({ max: 200 }).withMessage('Raison trop longue')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const database = getDatabase();
    const { courseId, date, attendances } = req.body;
    const recordedBy = req.user.id;
    
    // Vérifier que le cours existe
    const courseCheck = await new Promise((resolve, reject) => {
      database.get('SELECT id FROM courses WHERE id = ? AND isActive = 1', [courseId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!courseCheck) {
      return res.status(400).json({ error: 'Cours non trouvé' });
    }
    
    // Vérifier que tous les étudiants sont inscrits dans la classe du cours
    const studentIds = attendances.map(a => a.studentId);
    const enrollmentCheck = await new Promise((resolve, reject) => {
      database.all(`
        SELECT sc.studentId FROM student_class sc
        JOIN courses c ON sc.classId = c.classId
        WHERE sc.studentId IN (${studentIds.map(() => '?').join(',')}) 
        AND c.id = ? AND sc.isActive = 1
      `, [...studentIds, courseId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    if (enrollmentCheck.length !== studentIds.length) {
      return res.status(400).json({ error: 'Certains étudiants ne sont pas inscrits dans la classe de ce cours' });
    }
    
    // Supprimer les présences existantes pour cette date et ce cours
    await new Promise((resolve, reject) => {
      database.run('DELETE FROM attendance WHERE courseId = ? AND date = ?', [courseId, date], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Insérer les nouvelles présences
    const insertPromises = attendances.map(attendance => {
      return new Promise((resolve, reject) => {
        database.run(`
          INSERT INTO attendance (studentId, courseId, date, status, reason, recordedBy)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [attendance.studentId, courseId, date, attendance.status, attendance.reason || null, recordedBy], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
    });
    
    await Promise.all(insertPromises);
    
    res.status(201).json({
      message: `${attendances.length} présences enregistrées avec succès`
    });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/attendance/:id - Modifier une présence
router.put('/:id', attendanceValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const database = getDatabase();
    const { id } = req.params;
    const { status, reason } = req.body;
    
    database.run(`
      UPDATE attendance 
      SET status = ?, reason = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, reason, id], function(err) {
      if (err) {
        console.error('Erreur lors de la modification de la présence:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Présence non trouvée' });
      }
      
      res.json({ message: 'Présence modifiée avec succès' });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/attendance/:id - Supprimer une présence
router.delete('/:id', async (req, res) => {
  try {
    const database = getDatabase();
    const { id } = req.params;
    
    database.run(`
      DELETE FROM attendance WHERE id = ?
    `, [id], function(err) {
      if (err) {
        console.error('Erreur lors de la suppression de la présence:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Présence non trouvée' });
      }
      
      res.json({ message: 'Présence supprimée avec succès' });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/attendance/student/:studentId - Présences d'un étudiant
router.get('/student/:studentId', async (req, res) => {
  try {
    const database = getDatabase();
    const { studentId } = req.params;
    const { startDate, endDate, status } = req.query;
    
    let query = `
      SELECT 
        a.*,
        c.dayOfWeek,
        c.startTime,
        c.endTime,
        c.room,
        s.name as subjectName,
        s.code as subjectCode,
        cl.name as className,
        cl.level as classLevel
      FROM attendance a
      JOIN courses c ON a.courseId = c.id
      JOIN subjects s ON c.subjectId = s.id
      JOIN classes cl ON c.classId = cl.id
      WHERE a.studentId = ?
    `;
    
    const params = [studentId];
    
    if (startDate) {
      query += ' AND a.date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND a.date <= ?';
      params.push(endDate);
    }
    
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY a.date DESC, c.startTime';
    
    database.all(query, params, (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des présences de l\'étudiant:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.json(rows);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/attendance/course/:courseId - Présences d'un cours
router.get('/course/:courseId', async (req, res) => {
  try {
    const database = getDatabase();
    const { courseId } = req.params;
    const { date } = req.query;
    
    let query = `
      SELECT 
        a.*,
        u.firstName as studentFirstName,
        u.lastName as studentLastName,
        c.dayOfWeek,
        c.startTime,
        c.endTime,
        c.room,
        s.name as subjectName,
        s.code as subjectCode
      FROM attendance a
      JOIN users u ON a.studentId = u.id
      JOIN courses c ON a.courseId = c.id
      JOIN subjects s ON c.subjectId = s.id
      WHERE a.courseId = ?
    `;
    
    const params = [courseId];
    
    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }
    
    query += ' ORDER BY u.lastName, u.firstName';
    
    database.all(query, params, (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des présences du cours:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.json(rows);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/attendance/statistics/:classId - Statistiques des présences d'une classe
router.get('/statistics/:classId', async (req, res) => {
  try {
    const database = getDatabase();
    const { classId } = req.params;
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    const params = [classId];
    
    if (startDate && endDate) {
      dateFilter = ' AND a.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    database.all(`
      SELECT 
        u.id as studentId,
        u.firstName as studentFirstName,
        u.lastName as studentLastName,
        COUNT(a.id) as totalSessions,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentCount,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absentCount,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as lateCount,
        SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excusedCount
      FROM users u
      LEFT JOIN student_class sc ON u.id = sc.studentId
      LEFT JOIN courses c ON sc.classId = c.classId
      LEFT JOIN attendance a ON c.id = a.courseId AND u.id = a.studentId${dateFilter}
      WHERE sc.classId = ? AND sc.isActive = 1 AND u.role = 'student'
      GROUP BY u.id
      ORDER BY u.lastName, u.firstName
    `, params, (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des statistiques:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      // Calculer les pourcentages
      rows.forEach(row => {
        row.attendanceRate = row.totalSessions > 0 ? (row.presentCount / row.totalSessions * 100).toFixed(2) : 0;
        row.absenteeRate = row.totalSessions > 0 ? (row.absentCount / row.totalSessions * 100).toFixed(2) : 0;
      });
      
      res.json(rows);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
