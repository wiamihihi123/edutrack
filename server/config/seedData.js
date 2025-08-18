let getDatabase;

// Fonction pour initialiser la référence à getDatabase
function initDatabase(dbFunction) {
  getDatabase = dbFunction;
}
const bcrypt = require('bcryptjs');

// Données d'exemple pour le développement
const seedData = {
  users: [
    {
      email: 'teacher1@edutrack.com',
      password: 'teacher123',
      firstName: 'Marie',
      lastName: 'Dubois',
      role: 'teacher',
      phone: '0123456789',
      address: '123 Rue de la Paix, Paris',
      birthDate: '1985-03-15'
    },
    {
      email: 'teacher2@edutrack.com',
      password: 'teacher123',
      firstName: 'Pierre',
      lastName: 'Martin',
      role: 'teacher',
      phone: '0123456790',
      address: '456 Avenue des Champs, Lyon',
      birthDate: '1980-07-22'
    },
    {
      email: 'student1@edutrack.com',
      password: 'student123',
      firstName: 'Sophie',
      lastName: 'Bernard',
      role: 'student',
      phone: '0123456791',
      address: '789 Boulevard Central, Marseille',
      birthDate: '2000-11-08'
    },
    {
      email: 'student2@edutrack.com',
      password: 'student123',
      firstName: 'Lucas',
      lastName: 'Petit',
      role: 'student',
      phone: '0123456792',
      address: '321 Rue du Commerce, Toulouse',
      birthDate: '2001-04-12'
    }
  ],
  
  classes: [
    {
      name: 'Terminale S',
      level: 'Terminale',
      field: 'Scientifique',
      capacity: 35,
      academicYear: '2024-2025',
      description: 'Classe de terminale scientifique avec spécialité mathématiques'
    },
    {
      name: 'Première ES',
      level: 'Première',
      field: 'Économique et Social',
      capacity: 32,
      academicYear: '2024-2025',
      description: 'Classe de première économique et sociale'
    },
    {
      name: 'Seconde Générale',
      level: 'Seconde',
      field: 'Générale',
      capacity: 30,
      academicYear: '2024-2025',
      description: 'Classe de seconde générale et technologique'
    }
  ],
  
  subjects: [
    {
      name: 'Mathématiques',
      code: 'MATH',
      description: 'Mathématiques générales et spécialité',
      credits: 4
    },
    {
      name: 'Physique-Chimie',
      code: 'PHYS',
      description: 'Physique et chimie',
      credits: 3
    },
    {
      name: 'Sciences de la Vie et de la Terre',
      code: 'SVT',
      description: 'Biologie et géologie',
      credits: 3
    },
    {
      name: 'Histoire-Géographie',
      code: 'HIST',
      description: 'Histoire et géographie',
      credits: 2
    },
    {
      name: 'Français',
      code: 'FRAN',
      description: 'Littérature française',
      credits: 2
    },
    {
      name: 'Anglais',
      code: 'ANGL',
      description: 'Langue anglaise',
      credits: 2
    },
    {
      name: 'Sciences Économiques et Sociales',
      code: 'SES',
      description: 'Économie et sociologie',
      credits: 3
    }
  ]
};

// Fonction pour insérer les données d'exemple
async function insertSeedData() {
  const database = getDatabase();
  
  console.log('🌱 Insertion des données d\'exemple...');
  
  try {
    // Insérer les utilisateurs
    for (const userData of seedData.users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      await new Promise((resolve, reject) => {
        database.run(
          `INSERT OR IGNORE INTO users (email, password, firstName, lastName, role, phone, address, birthDate)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userData.email,
            hashedPassword,
            userData.firstName,
            userData.lastName,
            userData.role,
            userData.phone,
            userData.address,
            userData.birthDate
          ],
          function(err) {
            if (err) {
              console.error(`❌ Erreur lors de l'insertion de l'utilisateur ${userData.email}:`, err);
              reject(err);
            } else {
              if (this.changes > 0) {
                console.log(`✅ Utilisateur créé: ${userData.email}`);
              } else {
                console.log(`ℹ️  Utilisateur existe déjà: ${userData.email}`);
              }
              resolve();
            }
          }
        );
      });
    }
    
    // Insérer les classes
    for (const classData of seedData.classes) {
      await new Promise((resolve, reject) => {
        database.run(
          `INSERT OR IGNORE INTO classes (name, level, field, capacity, academicYear, description)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            classData.name,
            classData.level,
            classData.field,
            classData.capacity,
            classData.academicYear,
            classData.description
          ],
          function(err) {
            if (err) {
              console.error(`❌ Erreur lors de l'insertion de la classe ${classData.name}:`, err);
              reject(err);
            } else {
              if (this.changes > 0) {
                console.log(`✅ Classe créée: ${classData.name}`);
              } else {
                console.log(`ℹ️  Classe existe déjà: ${classData.name}`);
              }
              resolve();
            }
          }
        );
      });
    }
    
    // Insérer les matières
    for (const subjectData of seedData.subjects) {
      await new Promise((resolve, reject) => {
        database.run(
          `INSERT OR IGNORE INTO subjects (name, code, description, credits)
           VALUES (?, ?, ?, ?)`,
          [
            subjectData.name,
            subjectData.code,
            subjectData.description,
            subjectData.credits
          ],
          function(err) {
            if (err) {
              console.error(`❌ Erreur lors de l'insertion de la matière ${subjectData.name}:`, err);
              reject(err);
            } else {
              if (this.changes > 0) {
                console.log(`✅ Matière créée: ${subjectData.name}`);
              } else {
                console.log(`ℹ️  Matière existe déjà: ${subjectData.name}`);
              }
              resolve();
            }
          }
        );
      });
    }
    
    // Créer des inscriptions d'étudiants dans les classes
    await createStudentEnrollments(database);
    
    // Créer des cours
    await createCourses(database);
    
    console.log('✅ Données d\'exemple insérées avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données d\'exemple:', error);
  }
}

// Fonction pour créer des inscriptions d'étudiants
async function createStudentEnrollments(database) {
  console.log('📚 Création des inscriptions d\'étudiants...');
  
  try {
    // Récupérer les étudiants et les classes
    const students = await new Promise((resolve, reject) => {
      database.all(
        'SELECT id FROM users WHERE role = "student" AND isActive = 1',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    const classes = await new Promise((resolve, reject) => {
      database.all(
        'SELECT id FROM classes WHERE isActive = 1',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    // Inscrire les étudiants dans les classes
    for (const student of students) {
      for (const classItem of classes) {
        await new Promise((resolve, reject) => {
          database.run(
            'INSERT OR IGNORE INTO student_class (studentId, classId, academicYear) VALUES (?, ?, ?)',
            [student.id, classItem.id, '2024-2025'],
          function(err) {
            if (err) {
              console.error('❌ Erreur lors de l\'inscription:', err);
              reject(err);
            } else {
              resolve();
            }
          }
          );
        });
      }
    }
    
    console.log('✅ Inscriptions d\'étudiants créées!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des inscriptions:', error);
  }
}

// Fonction pour créer des cours
async function createCourses(database) {
  console.log('📅 Création des cours...');
  
  try {
    // Récupérer les enseignants, matières et classes
    const teachers = await new Promise((resolve, reject) => {
      database.all(
        'SELECT id FROM users WHERE role = "teacher" AND isActive = 1',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    const subjects = await new Promise((resolve, reject) => {
      database.all(
        'SELECT id FROM subjects WHERE isActive = 1',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    const classes = await new Promise((resolve, reject) => {
      database.all(
        'SELECT id FROM classes WHERE isActive = 1',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    // Créer des cours
    const courseData = [
      { dayOfWeek: 'monday', startTime: '08:00', endTime: '10:00', room: 'Salle 101' },
      { dayOfWeek: 'monday', startTime: '10:15', endTime: '12:15', room: 'Salle 102' },
      { dayOfWeek: 'tuesday', startTime: '08:00', endTime: '10:00', room: 'Salle 103' },
      { dayOfWeek: 'tuesday', startTime: '14:00', endTime: '16:00', room: 'Salle 104' },
      { dayOfWeek: 'wednesday', startTime: '08:00', endTime: '10:00', room: 'Salle 105' },
      { dayOfWeek: 'thursday', startTime: '10:15', endTime: '12:15', room: 'Salle 106' },
      { dayOfWeek: 'friday', startTime: '08:00', endTime: '10:00', room: 'Salle 107' }
    ];
    
    for (let i = 0; i < courseData.length; i++) {
      const course = courseData[i];
      const teacher = teachers[i % teachers.length];
      const subject = subjects[i % subjects.length];
      const classItem = classes[i % classes.length];
      
      await new Promise((resolve, reject) => {
        database.run(
          `INSERT OR IGNORE INTO courses (subjectId, classId, teacherId, dayOfWeek, startTime, endTime, room)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            subject.id,
            classItem.id,
            teacher.id,
            course.dayOfWeek,
            course.startTime,
            course.endTime,
            course.room
          ],
          function(err) {
            if (err) {
              console.error('❌ Erreur lors de la création du cours:', err);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    }
    
    console.log('✅ Cours créés!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des cours:', error);
  }
}

// Fonction pour vérifier si des données existent déjà
async function checkExistingData() {
  const database = getDatabase();
  
  return new Promise((resolve) => {
    database.get(
      'SELECT COUNT(*) as count FROM users WHERE role != "admin"',
      (err, row) => {
        if (err) {
          resolve(false);
        } else {
          resolve(row.count > 0);
        }
      }
    );
  });
}

// Fonction principale
async function seedDatabase() {
  try {
    const hasData = await checkExistingData();
    
    if (hasData) {
      console.log('ℹ️  Des données existent déjà dans la base. Voulez-vous les remplacer? (y/N)');
      // En mode automatique, on continue
    }
    
    await insertSeedData();
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding de la base de données:', error);
  }
}

module.exports = {
  seedDatabase,
  insertSeedData,
  initDatabase
};
