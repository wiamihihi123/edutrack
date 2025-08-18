import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Vérifier le token au démarrage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          // Vérifier si le token est valide
          const response = await authService.verifyToken(storedToken);
          if (response.user) {
            setUser(response.user);
            setIsAuthenticated(true);
            setToken(storedToken);
          } else {
            // Token invalide, le supprimer
            localStorage.removeItem('token');
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        
        toast.success(`Bienvenue ${response.user.firstName} !`);
        return { success: true };
      } else {
        throw new Error('Réponse de connexion invalide');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    try {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Fonction de changement de mot de passe
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setIsLoading(true);
      const response = await authService.changePassword(currentPassword, newPassword);
      
      if (response.message) {
        toast.success('Mot de passe modifié avec succès');
        return { success: true };
      } else {
        throw new Error('Réponse invalide');
      }
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      
      let errorMessage = 'Une erreur est survenue lors du changement de mot de passe';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de mise à jour du profil utilisateur
  const updateProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  // Fonction pour vérifier les permissions
  const hasRole = (requiredRoles) => {
    if (!user || !user.role) return false;
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    
    return user.role === requiredRoles;
  };

  // Fonction pour vérifier si l'utilisateur peut accéder à une ressource
  const canAccess = (resource, action = 'read') => {
    if (!user) return false;
    
    // Les administrateurs ont accès à tout
    if (user.role === 'admin') return true;
    
    // Logique spécifique selon le rôle et la ressource
    switch (user.role) {
      case 'teacher':
        // Les enseignants peuvent lire et modifier les cours, notes et présences
        if (['courses', 'grades', 'attendance'].includes(resource)) {
          return ['read', 'create', 'update'].includes(action);
        }
        // Les enseignants peuvent lire les informations des classes où ils enseignent
        if (resource === 'classes' && action === 'read') return true;
        break;
        
      case 'student':
        // Les étudiants peuvent lire leurs propres informations
        if (['profile', 'grades', 'attendance'].includes(resource) && action === 'read') {
          return true;
        }
        break;
        
      default:
        return false;
    }
    
    return false;
  };

  // Vérifier si le token va expirer bientôt
  const isTokenExpiringSoon = () => {
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;
      
      // Considérer comme "expirant bientôt" si moins de 1 heure
      return timeUntilExpiry < 3600;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return true;
    }
  };

  // Rafraîchir le token si nécessaire
  const refreshTokenIfNeeded = async () => {
    if (isTokenExpiringSoon()) {
      try {
        // Ici, vous pourriez implémenter une logique de rafraîchissement de token
        // Pour l'instant, on déconnecte l'utilisateur
        toast.warning('Votre session va expirer. Veuillez vous reconnecter.');
        logout();
      } catch (error) {
        console.error('Erreur lors du rafraîchissement du token:', error);
        logout();
      }
    }
  };

  // Vérifier le token périodiquement
  useEffect(() => {
    if (token) {
      const interval = setInterval(refreshTokenIfNeeded, 5 * 60 * 1000); // Vérifier toutes les 5 minutes
      return () => clearInterval(interval);
    }
  }, [token]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    token,
    login,
    logout,
    changePassword,
    updateProfile,
    hasRole,
    canAccess,
    refreshTokenIfNeeded
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
