const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../config/database');

// Validation pour la création/modification de notifications
const notificationValidation = [
  body('userId').isInt().withMessage('ID d\'utilisateur invalide'),
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Titre requis (max 100 caractères)'),
  body('message').trim().isLength({ min: 1, max: 500 }).withMessage('Message requis (max 500 caractères)'),
  body('type').isIn(['info', 'success', 'warning', 'error']).withMessage('Type invalide'),
  body('relatedEntity').optional().trim().isLength({ max: 50 }).withMessage('Entité liée trop longue'),
  body('relatedEntityId').optional().isInt().withMessage('ID d\'entité liée invalide')
];

// GET /api/notifications - Récupérer toutes les notifications avec filtres
router.get('/', async (req, res) => {
  try {
    const database = getDatabase();
    const { userId, type, isRead, startDate, endDate, limit = 50 } = req.query;
    
    let query = `
      SELECT 
        n.*,
        u.firstName as userFirstName,
        u.lastName as userLastName,
        u.email as userEmail
      FROM notifications n
      JOIN users u ON n.userId = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (userId) {
      query += ' AND n.userId = ?';
      params.push(userId);
    }
    
    if (type) {
      query += ' AND n.type = ?';
      params.push(type);
    }
    
    if (isRead !== undefined) {
      query += ' AND n.isRead = ?';
      params.push(isRead === 'true' ? 1 : 0);
    }
    
    if (startDate) {
      query += ' AND n.createdAt >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND n.createdAt <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY n.createdAt DESC LIMIT ?';
    params.push(parseInt(limit));
    
    database.all(query, params, (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des notifications:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.json(rows);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/notifications/:id - Récupérer une notification spécifique
router.get('/:id', async (req, res) => {
  try {
    const database = getDatabase();
    const { id } = req.params;
    
    database.get(`
      SELECT 
        n.*,
        u.firstName as userFirstName,
        u.lastName as userLastName,
        u.email as userEmail
      FROM notifications n
      JOIN users u ON n.userId = u.id
      WHERE n.id = ?
    `, [id], (err, row) => {
      if (err) {
        console.error('Erreur lors de la récupération de la notification:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Notification non trouvée' });
      }
      
      res.json(row);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/notifications - Créer une nouvelle notification
router.post('/', notificationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const database = getDatabase();
    const { userId, title, message, type, relatedEntity, relatedEntityId } = req.body;
    
    // Vérifier que l'utilisateur existe
    const userCheck = await new Promise((resolve, reject) => {
      database.get('SELECT id FROM users WHERE id = ? AND isActive = 1', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!userCheck) {
      return res.status(400).json({ error: 'Utilisateur non trouvé' });
    }
    
    database.run(`
      INSERT INTO notifications (userId, title, message, type, relatedEntity, relatedEntityId)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, title, message, type, relatedEntity, relatedEntityId], function(err) {
      if (err) {
        console.error('Erreur lors de la création de la notification:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.status(201).json({
        id: this.lastID,
        message: 'Notification créée avec succès'
      });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/notifications/bulk - Créer plusieurs notifications en une fois
router.post('/bulk', [
  body('notifications').isArray().withMessage('Liste des notifications requise'),
  body('notifications.*.userId').isInt().withMessage('ID d\'utilisateur invalide'),
  body('notifications.*.title').trim().isLength({ min: 1, max: 100 }).withMessage('Titre requis (max 100 caractères)'),
  body('notifications.*.message').trim().isLength({ min: 1, max: 500 }).withMessage('Message requis (max 500 caractères)'),
  body('notifications.*.type').isIn(['info', 'success', 'warning', 'error']).withMessage('Type invalide'),
  body('notifications.*.relatedEntity').optional().trim().isLength({ max: 50 }).withMessage('Entité liée trop longue'),
  body('notifications.*.relatedEntityId').optional().isInt().withMessage('ID d\'entité liée invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const database = getDatabase();
    const { notifications } = req.body;
    
    // Vérifier que tous les utilisateurs existent
    const userIds = notifications.map(n => n.userId);
    const userCheck = await new Promise((resolve, reject) => {
      database.all(`
        SELECT id FROM users 
        WHERE id IN (${userIds.map(() => '?').join(',')}) AND isActive = 1
      `, userIds, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    if (userCheck.length !== userIds.length) {
      return res.status(400).json({ error: 'Certains utilisateurs n\'existent pas' });
    }
    
    // Insérer les notifications
    const insertPromises = notifications.map(notification => {
      return new Promise((resolve, reject) => {
        database.run(`
          INSERT INTO notifications (userId, title, message, type, relatedEntity, relatedEntityId)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          notification.userId,
          notification.title,
          notification.message,
          notification.type,
          notification.relatedEntity || null,
          notification.relatedEntityId || null
        ], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
    });
    
    await Promise.all(insertPromises);
    
    res.status(201).json({
      message: `${notifications.length} notifications créées avec succès`
    });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/notifications/:id - Modifier une notification
router.put('/:id', notificationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const database = getDatabase();
    const { id } = req.params;
    const { title, message, type, relatedEntity, relatedEntityId } = req.body;
    
    database.run(`
      UPDATE notifications 
      SET title = ?, message = ?, type = ?, relatedEntity = ?, relatedEntityId = ?
      WHERE id = ?
    `, [title, message, type, relatedEntity, relatedEntityId, id], function(err) {
      if (err) {
        console.error('Erreur lors de la modification de la notification:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Notification non trouvée' });
      }
      
      res.json({ message: 'Notification modifiée avec succès' });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /api/notifications/:id/read - Marquer une notification comme lue
router.patch('/:id/read', async (req, res) => {
  try {
    const database = getDatabase();
    const { id } = req.params;
    
    database.run(`
      UPDATE notifications 
      SET isRead = 1
      WHERE id = ?
    `, [id], function(err) {
      if (err) {
        console.error('Erreur lors du marquage de la notification:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Notification non trouvée' });
      }
      
      res.json({ message: 'Notification marquée comme lue' });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /api/notifications/read-all - Marquer toutes les notifications d'un utilisateur comme lues
router.patch('/read-all', async (req, res) => {
  try {
    const database = getDatabase();
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'ID d\'utilisateur requis' });
    }
    
    database.run(`
      UPDATE notifications 
      SET isRead = 1
      WHERE userId = ? AND isRead = 0
    `, [userId], function(err) {
      if (err) {
        console.error('Erreur lors du marquage des notifications:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.json({ 
        message: `${this.changes} notifications marquées comme lues`,
        updatedCount: this.changes
      });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/notifications/:id - Supprimer une notification
router.delete('/:id', async (req, res) => {
  try {
    const database = getDatabase();
    const { id } = req.params;
    
    database.run(`
      DELETE FROM notifications WHERE id = ?
    `, [id], function(err) {
      if (err) {
        console.error('Erreur lors de la suppression de la notification:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Notification non trouvée' });
      }
      
      res.json({ message: 'Notification supprimée avec succès' });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/notifications/user/:userId - Notifications d'un utilisateur
router.get('/user/:userId', async (req, res) => {
  try {
    const database = getDatabase();
    const { userId } = req.params;
    const { type, isRead, limit = 20 } = req.query;
    
    let query = `
      SELECT 
        n.*,
        u.firstName as userFirstName,
        u.lastName as userLastName
      FROM notifications n
      JOIN users u ON n.userId = u.id
      WHERE n.userId = ?
    `;
    
    const params = [userId];
    
    if (type) {
      query += ' AND n.type = ?';
      params.push(type);
    }
    
    if (isRead !== undefined) {
      query += ' AND n.isRead = ?';
      params.push(isRead === 'true' ? 1 : 0);
    }
    
    query += ' ORDER BY n.createdAt DESC LIMIT ?';
    params.push(parseInt(limit));
    
    database.all(query, params, (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des notifications de l\'utilisateur:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.json(rows);
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/notifications/unread-count/:userId - Nombre de notifications non lues d'un utilisateur
router.get('/unread-count/:userId', async (req, res) => {
  try {
    const database = getDatabase();
    const { userId } = req.params;
    
    database.get(`
      SELECT COUNT(*) as count
      FROM notifications 
      WHERE userId = ? AND isRead = 0
    `, [userId], (err, row) => {
      if (err) {
        console.error('Erreur lors du comptage des notifications non lues:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      res.json({ unreadCount: row.count });
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Fonction utilitaire pour créer des notifications système
async function createSystemNotification(database, userId, title, message, type = 'info', relatedEntity = null, relatedEntityId = null) {
  return new Promise((resolve, reject) => {
    database.run(`
      INSERT INTO notifications (userId, title, message, type, relatedEntity, relatedEntityId)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, title, message, type, relatedEntity, relatedEntityId], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

module.exports = router;
