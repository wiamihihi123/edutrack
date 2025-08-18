const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');

// GET /api/dashboard/overview - Vue d'ensemble du tableau de bord
router.get('/overview', async (req, res) => {
  try {
    const database = getDatabase();
    
    // Statistiques générales
    const stats = await new Promise((resolve, reject) => {
      database.get(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE role = 'student' AND isActive = 1) as totalStudents,
          (SELECT COUNT(*) FROM users WHERE role = 'teacher' AND isActive = 1) as totalTeachers,
          (SELECT COUNT(*) FROM classes WHERE isActive = 1) as totalClasses,
          (SELECT COUNT(*) FROM subjects WHERE isActive = 1) as totalSubjects,
          (SELECT COUNT(*) FROM courses WHERE isActive = 1) as totalCourses
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Présences du jour
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await new Promise((resolve, reject) => {
      database.get(`
        SELECT 
          COUNT(*) as totalSessions,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as presentCount,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absentCount,
          SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as lateCount
        FROM attendance 
        WHERE date = ?
      `, [today], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Notes récentes
    const recentGrades = await new Promise((resolve, reject) => {
      database.all(`
        SELECT 
          g.*,
          u.firstName as studentFirstName,
          u.lastName as studentLastName,
          s.name as subjectName,
          cl.name as className
        FROM grades g
        JOIN users u ON g.studentId = u.id
        JOIN subjects s ON g.subjectId = s.id
        JOIN classes cl ON g.classId = cl.id
        ORDER BY g.createdAt DESC
        LIMIT 10
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Notifications récentes
    const recentNotifications = await new Promise((resolve, reject) => {
      database.all(`
        SELECT 
          n.*,
          u.firstName as userFirstName,
          u.lastName as userLastName
        FROM notifications n
        JOIN users u ON n.userId = u.id
        ORDER BY n.createdAt DESC
        LIMIT 10
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({
      stats,
      todayAttendance,
      recentGrades,
      recentNotifications
    });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/dashboard/class/:classId - Statistiques d'une classe spécifique
router.get('/class/:classId', async (req, res) => {
  try {
    const database = getDatabase();
    const { classId } = req.params;
    
    // Informations de la classe
    const classInfo = await new Promise((resolve, reject) => {
      database.get(`
        SELECT 
          c.*,
          COUNT(sc.studentId) as currentEnrollment,
          u.firstName as headTeacherFirstName,
          u.lastName as headTeacherLastName
        FROM classes c
        LEFT JOIN student_class sc ON c.id = sc.classId AND sc.isActive = 1
        LEFT JOIN users u ON c.headTeacherId = u.id
        WHERE c.id = ?
        GROUP BY c.id
      `, [classId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!classInfo) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }
    
    // Statistiques des notes par matière
    const gradeStats = await new Promise((resolve, reject) => {
      database.all(`
        SELECT 
          s.name as subjectName,
          s.code as subjectCode,
          COUNT(g.id) as totalGrades,
          AVG(g.score) as averageScore,
          MIN(g.score) as minScore,
          MAX(g.score) as maxScore,
          SUM(CASE WHEN g.score >= 10 THEN 1 ELSE 0 END) as passingGrades,
          SUM(CASE WHEN g.score < 10 THEN 1 ELSE 0 END) as failingGrades
        FROM subjects s
        LEFT JOIN grades g ON s.id = g.subjectId AND g.classId = ?
        WHERE s.isActive = 1
        GROUP BY s.id
        ORDER BY s.name
      `, [classId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Statistiques des présences
    const attendanceStats = await new Promise((resolve, reject) => {
      database.get(`
        SELECT 
          COUNT(a.id) as totalSessions,
          SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentCount,
          SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absentCount,
          SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as lateCount,
          SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excusedCount
        FROM attendance a
        JOIN courses c ON a.courseId = c.id
        WHERE c.classId = ?
      `, [classId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Calculer les pourcentages
    if (gradeStats) {
      gradeStats.forEach(subject => {
        subject.passingPercentage = subject.totalGrades > 0 ? (subject.passingGrades / subject.totalGrades * 100).toFixed(2) : 0;
        subject.failingPercentage = subject.totalGrades > 0 ? (subject.failingGrades / subject.totalGrades * 100).toFixed(2) : 0;
        subject.averageScore = subject.averageScore ? subject.averageScore.toFixed(2) : 0;
      });
    }
    
    if (attendanceStats && attendanceStats.totalSessions > 0) {
      attendanceStats.attendanceRate = (attendanceStats.presentCount / attendanceStats.totalSessions * 100).toFixed(2);
      attendanceStats.absenteeRate = (attendanceStats.absentCount / attendanceStats.totalSessions * 100).toFixed(2);
    }
    
    res.json({
      classInfo,
      gradeStats,
      attendanceStats
    });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/dashboard/teacher/:teacherId - Statistiques d'un enseignant
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const database = getDatabase();
    const { teacherId } = req.params;
    
    // Informations de l'enseignant
    const teacherInfo = await new Promise((resolve, reject) => {
      database.get(`
        SELECT 
          u.*,
          COUNT(DISTINCT c.id) as totalCourses,
          COUNT(DISTINCT c.classId) as totalClasses
        FROM users u
        LEFT JOIN courses c ON u.id = c.teacherId AND c.isActive = 1
        WHERE u.id = ? AND u.role = 'teacher'
        GROUP BY u.id
      `, [teacherId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!teacherInfo) {
      return res.status(404).json({ error: 'Enseignant non trouvé' });
    }
    
    // Cours de l'enseignant
    const teacherCourses = await new Promise((resolve, reject) => {
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
        ORDER BY c.dayOfWeek, c.startTime
      `, [teacherId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Statistiques des notes données par l'enseignant
    const gradeStats = await new Promise((resolve, reject) => {
      database.get(`
        SELECT 
          COUNT(g.id) as totalGrades,
          AVG(g.score) as averageScore,
          MIN(g.score) as minScore,
          MAX(g.score) as maxScore
        FROM grades g
        JOIN courses c ON g.classId = c.classId AND g.subjectId = c.subjectId
        WHERE c.teacherId = ?
      `, [teacherId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (gradeStats) {
      gradeStats.averageScore = gradeStats.averageScore ? gradeStats.averageScore.toFixed(2) : 0;
    }
    
    res.json({
      teacherInfo,
      teacherCourses,
      gradeStats
    });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/dashboard/student/:studentId - Statistiques d'un étudiant
router.get('/student/:studentId', async (req, res) => {
  try {
    const database = getDatabase();
    const { studentId } = req.params;
    
    // Informations de l'étudiant
    const studentInfo = await new Promise((resolve, reject) => {
      database.get(`
        SELECT 
          u.*,
          COUNT(DISTINCT sc.classId) as totalClasses
        FROM users u
        LEFT JOIN student_class sc ON u.id = sc.studentId AND sc.isActive = 1
        WHERE u.id = ? AND u.role = 'student'
        GROUP BY u.id
      `, [studentId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!studentInfo) {
      return res.status(404).json({ error: 'Étudiant non trouvé' });
    }
    
    // Classes de l'étudiant
    const studentClasses = await new Promise((resolve, reject) => {
      database.all(`
        SELECT 
          cl.*,
          sc.enrollmentDate
        FROM classes cl
        JOIN student_class sc ON cl.id = sc.classId
        WHERE sc.studentId = ? AND sc.isActive = 1
        ORDER BY cl.level, cl.name
      `, [studentId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Notes de l'étudiant par matière
    const studentGrades = await new Promise((resolve, reject) => {
      database.all(`
        SELECT 
          g.*,
          s.name as subjectName,
          s.code as subjectCode,
          cl.name as className
        FROM grades g
        JOIN subjects s ON g.subjectId = s.id
        JOIN classes cl ON g.classId = cl.id
        WHERE g.studentId = ?
        ORDER BY g.examDate DESC
      `, [studentId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Présences de l'étudiant
    const studentAttendance = await new Promise((resolve, reject) => {
      database.get(`
        SELECT 
          COUNT(a.id) as totalSessions,
          SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentCount,
          SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absentCount,
          SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as lateCount,
          SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excusedCount
        FROM attendance a
        WHERE a.studentId = ?
      `, [studentId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Calculer les moyennes par matière
    const gradesBySubject = {};
    studentGrades.forEach(grade => {
      if (!gradesBySubject[grade.subjectId]) {
        gradesBySubject[grade.subjectId] = {
          subjectName: grade.subjectName,
          subjectCode: grade.subjectCode,
          grades: [],
          average: 0
        };
      }
      gradesBySubject[grade.subjectId].grades.push(grade);
    });
    
    // Calculer la moyenne pour chaque matière
    Object.values(gradesBySubject).forEach(subject => {
      const total = subject.grades.reduce((sum, grade) => sum + grade.score, 0);
      subject.average = (total / subject.grades.length).toFixed(2);
    });
    
    // Calculer la moyenne générale
    const totalScore = studentGrades.reduce((sum, grade) => sum + grade.score, 0);
    const generalAverage = studentGrades.length > 0 ? (totalScore / studentGrades.length).toFixed(2) : 0;
    
    // Calculer le taux de présence
    if (studentAttendance && studentAttendance.totalSessions > 0) {
      studentAttendance.attendanceRate = (studentAttendance.presentCount / studentAttendance.totalSessions * 100).toFixed(2);
    }
    
    res.json({
      studentInfo,
      studentClasses,
      studentGrades,
      gradesBySubject,
      generalAverage,
      studentAttendance
    });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/dashboard/academic-year/:year - Statistiques d'une année académique
router.get('/academic-year/:year', async (req, res) => {
  try {
    const database = getDatabase();
    const { year } = req.params;
    
    // Statistiques générales de l'année
    const yearStats = await new Promise((resolve, reject) => {
      database.get(`
        SELECT 
          (SELECT COUNT(*) FROM classes WHERE academicYear = ? AND isActive = 1) as totalClasses,
          (SELECT COUNT(*) FROM student_class WHERE academicYear = ? AND isActive = 1) as totalEnrollments,
          (SELECT COUNT(DISTINCT studentId) FROM student_class WHERE academicYear = ? AND isActive = 1) as uniqueStudents
      `, [year, year, year], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Répartition des étudiants par classe
    const classDistribution = await new Promise((resolve, reject) => {
      database.all(`
        SELECT 
          cl.name as className,
          cl.level as classLevel,
          cl.field as classField,
          COUNT(sc.studentId) as studentCount
        FROM classes cl
        LEFT JOIN student_class sc ON cl.id = sc.classId AND sc.academicYear = ? AND sc.isActive = 1
        WHERE cl.academicYear = ? AND cl.isActive = 1
        GROUP BY cl.id
        ORDER BY cl.level, cl.name
      `, [year, year], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Statistiques des notes par niveau
    const gradeStatsByLevel = await new Promise((resolve, reject) => {
      database.all(`
        SELECT 
          cl.level as classLevel,
          COUNT(g.id) as totalGrades,
          AVG(g.score) as averageScore,
          SUM(CASE WHEN g.score >= 10 THEN 1 ELSE 0 END) as passingGrades,
          SUM(CASE WHEN g.score < 10 THEN 1 ELSE 0 END) as failingGrades
        FROM grades g
        JOIN classes cl ON g.classId = cl.id
        JOIN student_class sc ON g.studentId = sc.studentId AND g.classId = sc.classId
        WHERE sc.academicYear = ?
        GROUP BY cl.level
        ORDER BY cl.level
      `, [year], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Calculer les pourcentages
    gradeStatsByLevel.forEach(level => {
      level.passingPercentage = level.totalGrades > 0 ? (level.passingGrades / level.totalGrades * 100).toFixed(2) : 0;
      level.failingPercentage = level.totalGrades > 0 ? (level.failingGrades / level.totalGrades * 100).toFixed(2) : 0;
      level.averageScore = level.averageScore ? level.averageScore.toFixed(2) : 0;
    });
    
    res.json({
      year,
      yearStats,
      classDistribution,
      gradeStatsByLevel
    });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/dashboard/charts - Données pour les graphiques
router.get('/charts', async (req, res) => {
  try {
    const database = getDatabase();
    
    // Répartition des étudiants par rôle
    const userDistribution = await new Promise((resolve, reject) => {
      database.all(`
        SELECT 
          role,
          COUNT(*) as count
        FROM users 
        WHERE isActive = 1
        GROUP BY role
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Répartition des classes par niveau
    const classDistribution = await new Promise((resolve, reject) => {
      database.all(`
        SELECT 
          level,
          COUNT(*) as count
        FROM classes 
        WHERE isActive = 1
        GROUP BY level
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Évolution des présences sur les 7 derniers jours
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }
    
    const attendanceEvolution = await Promise.all(last7Days.map(async (date) => {
      return new Promise((resolve, reject) => {
        database.get(`
          SELECT 
            COUNT(*) as totalSessions,
            SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as presentCount
          FROM attendance 
          WHERE date = ?
        `, [date], (err, row) => {
          if (err) reject(err);
          else {
            const attendanceRate = row.totalSessions > 0 ? (row.presentCount / row.totalSessions * 100).toFixed(2) : 0;
            resolve({
              date,
              attendanceRate: parseFloat(attendanceRate),
              totalSessions: row.totalSessions || 0
            });
          }
        });
      });
    }));
    
    // Top 5 des matières par moyenne
    const topSubjects = await new Promise((resolve, reject) => {
      database.all(`
        SELECT 
          s.name as subjectName,
          s.code as subjectCode,
          AVG(g.score) as averageScore,
          COUNT(g.id) as totalGrades
        FROM subjects s
        JOIN grades g ON s.id = g.subjectId
        WHERE s.isActive = 1
        GROUP BY s.id
        HAVING totalGrades >= 5
        ORDER BY averageScore DESC
        LIMIT 5
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Formater les données
    topSubjects.forEach(subject => {
      subject.averageScore = subject.averageScore ? subject.averageScore.toFixed(2) : 0;
    });
    
    res.json({
      userDistribution,
      classDistribution,
      attendanceEvolution,
      topSubjects
    });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
