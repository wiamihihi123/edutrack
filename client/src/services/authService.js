import axios from 'axios';

// Configuration de base d'axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Instance axios avec configuration de base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Service d'authentification
export const authService = {
  // Connexion
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Inscription (réservée aux administrateurs)
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Vérification du token
  async verifyToken(token) {
    try {
      const response = await apiClient.get('/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Changement de mot de passe
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Déconnexion (côté client uniquement)
  logout() {
    localStorage.removeItem('token');
    // Redirection vers la page de connexion
    window.location.href = '/login';
  },
};

// Service pour les utilisateurs
export const userService = {
  // Récupérer tous les utilisateurs
  async getUsers(params = {}) {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer un utilisateur par ID
  async getUserById(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer le profil d'un utilisateur
  async getUserProfile(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Créer un nouvel utilisateur
  async createUser(userData) {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour un utilisateur
  async updateUser(userId, userData) {
    try {
      const response = await apiClient.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Désactiver un utilisateur
  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Service pour les classes
export const classService = {
  // Récupérer toutes les classes
  async getClasses(params = {}) {
    try {
      const response = await apiClient.get('/classes', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer une classe par ID
  async getClassById(classId) {
    try {
      const response = await apiClient.get(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Créer une nouvelle classe
  async createClass(classData) {
    try {
      const response = await apiClient.post('/classes', classData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour une classe
  async updateClass(classId, classData) {
    try {
      const response = await apiClient.put(`/classes/${classId}`, classData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Désactiver une classe
  async deleteClass(classId) {
    try {
      const response = await apiClient.delete(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les étudiants d'une classe
  async getClassStudents(classId) {
    try {
      const response = await apiClient.get(`/classes/${classId}/students`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les cours d'une classe
  async getClassCourses(classId) {
    try {
      const response = await apiClient.get(`/classes/${classId}/courses`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Inscrire un étudiant dans une classe
  async enrollStudent(classId, enrollmentData) {
    try {
      const response = await apiClient.post(`/classes/${classId}/enroll`, enrollmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Service pour les matières
export const subjectService = {
  // Récupérer toutes les matières
  async getSubjects(params = {}) {
    try {
      const response = await apiClient.get('/subjects', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer une matière par ID
  async getSubjectById(subjectId) {
    try {
      const response = await apiClient.get(`/subjects/${subjectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Créer une nouvelle matière
  async createSubject(subjectData) {
    try {
      const response = await apiClient.post('/subjects', subjectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour une matière
  async updateSubject(subjectId, subjectData) {
    try {
      const response = await apiClient.put(`/subjects/${subjectId}`, subjectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Désactiver une matière
  async deleteSubject(subjectId) {
    try {
      const response = await apiClient.delete(`/subjects/${subjectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Service pour les cours
export const courseService = {
  // Récupérer tous les cours
  async getCourses(params = {}) {
    try {
      const response = await apiClient.get('/courses', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer un cours par ID
  async getCourseById(courseId) {
    try {
      const response = await apiClient.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Créer un nouveau cours
  async createCourse(courseData) {
    try {
      const response = await apiClient.post('/courses', courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour un cours
  async updateCourse(courseId, courseData) {
    try {
      const response = await apiClient.put(`/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Désactiver un cours
  async deleteCourse(courseId) {
    try {
      const response = await apiClient.delete(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Service pour les notes
export const gradeService = {
  // Récupérer toutes les notes
  async getGrades(params = {}) {
    try {
      const response = await apiClient.get('/grades', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les notes d'un étudiant
  async getStudentGrades(studentId, params = {}) {
    try {
      const response = await apiClient.get(`/grades/student/${studentId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Créer une nouvelle note
  async createGrade(gradeData) {
    try {
      const response = await apiClient.post('/grades', gradeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour une note
  async updateGrade(gradeId, gradeData) {
    try {
      const response = await apiClient.put(`/grades/${gradeId}`, gradeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer une note
  async deleteGrade(gradeId) {
    try {
      const response = await apiClient.delete(`/grades/${gradeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Service pour les présences
export const attendanceService = {
  // Récupérer toutes les présences
  async getAttendance(params = {}) {
    try {
      const response = await apiClient.get('/attendance', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les présences d'un étudiant
  async getStudentAttendance(studentId, params = {}) {
    try {
      const response = await apiClient.get(`/attendance/student/${studentId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Marquer une présence
  async markAttendance(attendanceData) {
    try {
      const response = await apiClient.post('/attendance', attendanceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour une présence
  async updateAttendance(attendanceId, attendanceData) {
    try {
      const response = await apiClient.put(`/attendance/${attendanceId}`, attendanceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer une présence
  async deleteAttendance(attendanceId) {
    try {
      const response = await apiClient.delete(`/attendance/${attendanceId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Service pour le tableau de bord
export const dashboardService = {
  // Récupérer les statistiques du tableau de bord
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les graphiques du tableau de bord
  async getDashboardCharts() {
    try {
      const response = await apiClient.get('/dashboard/charts');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Export par défaut
export default {
  authService,
  userService,
  classService,
  subjectService,
  courseService,
  gradeService,
  attendanceService,
  dashboardService,
};
