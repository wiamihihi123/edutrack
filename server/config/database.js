const sqlite3 = require('sqlite3').verbose();
const { initDatabase } = require('./seedData');

const path = require('path');
const bcrypt = require('bcryptjs');
const { seedDatabase } = require('./seedData');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database/edutrack.db');

// Créer le répertoire database s'il n'existe pas
const fs = require('fs');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;

function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
      } else {
        console.log('Base de données SQLite connectée');
      }
    });
  }
  return db;
}

async function initializeDatabase() {
  const database = getDatabase();
  
  return new Promise((resolve, reject) => {
    database.serialize(() => {
      // Table des utilisateurs
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          firstName TEXT NOT NULL,
          lastName TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student')),
          phone TEXT,
          address TEXT,
          birthDate TEXT,
          profileImage TEXT,
          isActive BOOLEAN DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Table des classes
      database.run(`
        CREATE TABLE IF NOT EXISTS classes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          level TEXT NOT NULL,
          field TEXT NOT NULL,
          capacity INTEGER NOT NULL,
          academicYear TEXT NOT NULL,
          headTeacherId INTEGER,
          description TEXT,
          isActive BOOLEAN DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (headTeacherId) REFERENCES users (id)
        )
      `);

      // Table des matières
      database.run(`
        CREATE TABLE IF NOT EXISTS subjects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          code TEXT UNIQUE NOT NULL,
          description TEXT,
          credits INTEGER DEFAULT 1,
          isActive BOOLEAN DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Table des cours
      database.run(`
        CREATE TABLE IF NOT EXISTS courses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          subjectId INTEGER NOT NULL,
          classId INTEGER NOT NULL,
          teacherId INTEGER NOT NULL,
          dayOfWeek TEXT NOT NULL CHECK(dayOfWeek IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')),
          startTime TEXT NOT NULL,
          endTime TEXT NOT NULL,
          room TEXT,
          isActive BOOLEAN DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (subjectId) REFERENCES subjects (id),
          FOREIGN KEY (classId) REFERENCES classes (id),
          FOREIGN KEY (teacherId) REFERENCES users (id)
        )
      `);

      // Table des inscriptions étudiants-classe
      database.run(`
        CREATE TABLE IF NOT EXISTS student_class (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          studentId INTEGER NOT NULL,
          classId INTEGER NOT NULL,
          academicYear TEXT NOT NULL,
          enrollmentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
          isActive BOOLEAN DEFAULT 1,
          FOREIGN KEY (studentId) REFERENCES users (id),
          FOREIGN KEY (classId) REFERENCES classes (id),
          UNIQUE(studentId, classId, academicYear)
        )
      `);

      // Table des notes
      database.run(`
        CREATE TABLE IF NOT EXISTS grades (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          studentId INTEGER NOT NULL,
          subjectId INTEGER NOT NULL,
          classId INTEGER NOT NULL,
          examType TEXT NOT NULL CHECK(examType IN ('quiz', 'midterm', 'final', 'assignment')),
          score REAL NOT NULL CHECK(score >= 0 AND score <= 20),
          maxScore REAL DEFAULT 20,
          weight REAL DEFAULT 1.0,
          examDate TEXT,
          comments TEXT,
          recordedBy INTEGER NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (studentId) REFERENCES users (id),
          FOREIGN KEY (subjectId) REFERENCES subjects (id),
          FOREIGN KEY (classId) REFERENCES classes (id),
          FOREIGN KEY (recordedBy) REFERENCES users (id)
        )
      `);

      // Table des présences
      database.run(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          studentId INTEGER NOT NULL,
          courseId INTEGER NOT NULL,
          date TEXT NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late', 'excused')),
          reason TEXT,
          recordedBy INTEGER NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (studentId) REFERENCES users (id),
          FOREIGN KEY (courseId) REFERENCES courses (id),
          FOREIGN KEY (recordedBy) REFERENCES users (id),
          UNIQUE(studentId, courseId, date)
        )
      `);

      // Table des notifications
      database.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('info', 'success', 'warning', 'error')),
          isRead BOOLEAN DEFAULT 0,
          relatedEntity TEXT,
          relatedEntityId INTEGER,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users (id)
        )
      `);

      // Créer un administrateur par défaut
      createDefaultAdmin(database)
        .then(() => {
          console.log('✅ Tables créées avec succès');
          
          // Insérer des données d'exemple en mode développement
          if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
            console.log('🌱 Mode développement détecté, insertion des données d\'exemple...');
            return seedDatabase();
          } else {
            console.log('🚀 Mode production, pas de données d\'exemple');
            return Promise.resolve();
          }
        })
        .then(() => {
          console.log('✅ Base de données initialisée avec succès');
          resolve();
        })
        .catch(reject);
    });
  });
}

async function createDefaultAdmin(database) {
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  return new Promise((resolve, reject) => {
    database.get(
      'SELECT id FROM users WHERE email = ?',
      ['admin@edutrack.com'],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          database.run(`
            INSERT INTO users (email, password, firstName, lastName, role, isActive)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            'admin@edutrack.com',
            hashedPassword,
            'Admin',
            'EduTrack',
            'admin',
            1
          ], (err) => {
            if (err) {
              reject(err);
            } else {
              console.log('👤 Administrateur par défaut créé: admin@edutrack.com / admin123');
              resolve();
            }
          });
        } else {
          console.log('👤 Administrateur existe déjà');
          resolve();
        }
      }
    );
  });
}

function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Erreur lors de la fermeture de la base de données:', err.message);
      } else {
        console.log('Base de données fermée');
      }
    });
  }
}

// Gestion de la fermeture propre
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});

initDatabase(getDatabase);

module.exports = {
  getDatabase,
  initializeDatabase,
  closeDatabase
};
