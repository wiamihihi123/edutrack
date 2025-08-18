const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../config/database');

// Validation pour la création/modification de cours
const courseValidation = [
  body('subjectId').isInt().withMessage('ID de matière invalide'),
  body('classId').isInt().withMessage('ID de classe invalide'),
  body('teacherId').isInt().withMessage('ID d\'enseignant invalide'),
  body('dayOfWeek').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']).withMessage('Jour de la semaine invalide'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de début invalide (format HH:MM)'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de fin invalide (format HH:MM)'),
  body('room').optional().trim().isLength({ min: 1 }).withMessage('Salle requise')
];

// GET /api/courses - Récupérer tous les cours
router.get('/', async (req, res) => {
  try {
    const database = getDatabase();
    const { classId, teacherId, subjectId, dayOfWeek } = req.query;
    
    let query = `
      SELECT 
        c.*,
        s.name as subjectName,
        s.code as subjectCode,
        cl.name as className,
        cl.level as classLevel,
        u.firstName as teacherFirstName,
        u.lastName as teacherLastName
      FROM courses c
      JOIN subjects s ON c.subjectId = s.id
      JOIN classes cl ON c.classId = cl.id
      JOIN users u ON c.teacherId = u.id
      WHERE c.isActive = 1
    `;
    
    const params = [];
    
    if (classId) {
      query += ' AND c.classId = ?';
      params.push(classId);
    }
    
    if (teacherId) {
      query += ' AND c.teacherId = ?';
      params.push(teacherId);
    }
    
    if (subjectId) {
      query += ' AND c.subjectId = ?';
      params.push(subjectId);
    }
    
    if (dayOfWeek) {
      query += ' AND c.dayOfWeek = ?';
      params.push(dayOfWeek);
    }
    
    query += ' ORDER BY c.dayOfWeek, c.startTime';
    
    database.all(query, params, (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des cours:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.json(rows);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/courses/:id - Récupérer un cours spécifique
router.get('/:id', async (req, res) => {
  try {
    const database = getDatabase();
    const { id } = req.params;
    
    database.get(`
      SELECT 
        c.*,
        s.name as subjectName,
        s.code as subjectCode,
        cl.name as className,
        cl.level as classLevel,
        u.firstName as teacherFirstName,
        u.lastName as teacherLastName
      FROM courses c
      JOIN subjects s ON c.subjectId = s.id
      JOIN classes cl ON c.classId = cl.id
      JOIN users u ON c.teacherId = u.id
      WHERE c.id = ? AND c.isActive = 1
    `, [id], (err, row) => {
      if (err) {
        console.error('Erreur lors de la récupération du cours:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Cours non trouvé' });
      }
      
      res.json(row);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/courses - Créer un nouveau cours
router.post('/', courseValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const database = getDatabase();
    const { subjectId, classId, teacherId, dayOfWeek, startTime, endTime, room } = req.body;
    
    // Vérifier les conflits d'horaires
    const conflictCheck = await new Promise((resolve, reject) => {
      database.get(`
        SELECT COUNT(*) as count FROM courses 
        WHERE classId = ? AND dayOfWeek = ? AND isActive = 1
        AND (
          (startTime <= ? AND endTime > ?) OR
          (startTime < ? AND endTime >= ?) OR
          (startTime >= ? AND endTime <= ?)
        )
      `, [classId, dayOfWeek, startTime, startTime, endTime, endTime, startTime, endTime], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (conflictCheck.count > 0) {
      return res.status(400).json({ error: 'Conflit d\'horaires détecté' });
    }
    
    database.run(`
      INSERT INTO courses (subjectId, classId, teacherId, dayOfWeek, startTime, endTime, room)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [subjectId, classId, teacherId, dayOfWeek, startTime, endTime, room], function(err) {
      if (err) {
        console.error('Erreur lors de la création du cours:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.status(201).json({
        id: this.lastID,
        message: 'Cours créé avec succès'
      });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/courses/:id - Modifier un cours
router.put('/:id', courseValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const database = getDatabase();
    const { id } = req.params;
    const { subjectId, classId, teacherId, dayOfWeek, startTime, endTime, room } = req.body;
    
    // Vérifier les conflits d'horaires (exclure le cours actuel)
    const conflictCheck = await new Promise((resolve, reject) => {
      database.get(`
        SELECT COUNT(*) as count FROM courses 
        WHERE classId = ? AND dayOfWeek = ? AND isActive = 1 AND id != ?
        AND (
          (startTime <= ? AND endTime > ?) OR
          (startTime < ? AND endTime >= ?) OR
          (startTime >= ? AND endTime <= ?)
        )
      `, [classId, dayOfWeek, id, startTime, startTime, endTime, endTime, startTime, endTime], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (conflictCheck.count > 0) {
      return res.status(400).json({ error: 'Conflit d\'horaires détecté' });
    }
    
    database.run(`
      UPDATE courses 
      SET subjectId = ?, classId = ?, teacherId = ?, dayOfWeek = ?, startTime = ?, endTime = ?, room = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND isActive = 1
    `, [subjectId, classId, teacherId, dayOfWeek, startTime, endTime, room, id], function(err) {
      if (err) {
        console.error('Erreur lors de la modification du cours:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Cours non trouvé' });
      }
      
      res.json({ message: 'Cours modifié avec succès' });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/courses/:id - Supprimer un cours (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const database = getDatabase();
    const { id } = req.params;
    
    database.run(`
      UPDATE courses 
      SET isActive = 0, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND isActive = 1
    `, [id], function(err) {
      if (err) {
        console.error('Erreur lors de la suppression du cours:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Cours non trouvé' });
      }
      
      res.json({ message: 'Cours supprimé avec succès' });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/courses/schedule/:classId - Emploi du temps d'une classe
router.get('/schedule/:classId', async (req, res) => {
  try {
    const database = getDatabase();
    const { classId } = req.params;
    
    database.all(`
      SELECT 
        c.*,
        s.name as subjectName,
        s.code as subjectCode,
        u.firstName as teacherFirstName,
        u.lastName as teacherLastName
      FROM courses c
      JOIN subjects s ON c.subjectId = s.id
      JOIN users u ON c.teacherId = u.id
      WHERE c.classId = ? AND c.isActive = 1
      ORDER BY 
        CASE c.dayOfWeek
          WHEN 'monday' THEN 1
          WHEN 'tuesday' THEN 2
          WHEN 'wednesday' THEN 3
          WHEN 'thursday' THEN 4
          WHEN 'friday' THEN 5
          WHEN 'saturday' THEN 6
        END,
        c.startTime
    `, [classId], (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération de l\'emploi du temps:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      // Organiser par jour de la semaine
      const schedule = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: []
      };
      
      rows.forEach(course => {
        schedule[course.dayOfWeek].push(course);
      });
      
      res.json(schedule);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/courses/teacher/:teacherId - Cours d'un enseignant
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const database = getDatabase();
    const { teacherId } = req.params;
    
    database.all(`
      SELECT 
        c.*,
        s.name as subjectName,
        s.code as subjectCode,
        cl.name as className,
        cl.level as classLevel
      FROM courses c
      JOIN subjects s ON c.subjectId = s.id
      JOIN classes cl ON c.classId = cl.id
      WHERE c.teacherId = ? AND c.isActive = 1
      ORDER BY 
        CASE c.dayOfWeek
          WHEN 'monday' THEN 1
          WHEN 'tuesday' THEN 2
          WHEN 'wednesday' THEN 3
          WHEN 'thursday' THEN 4
          WHEN 'friday' THEN 5
          WHEN 'saturday' THEN 6
        END,
        c.startTime
    `, [teacherId], (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des cours de l\'enseignant:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.json(rows);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
