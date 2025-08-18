import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Composants
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Classes from './pages/Classes';
import Subjects from './pages/Subjects';
import Courses from './pages/Courses';
import Grades from './pages/Grades';
import Attendance from './pages/Attendance';
import Profile from './pages/Profile';
import Login from './pages/Auth/Login';
import Layout from './components/Layout/Layout';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Styles
import './App.css';

// Configuration du thème Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Configuration de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Composant pour les routes protégées
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>; // Ou un composant de chargement
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Composant principal de l'application
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement de l'application...</div>; // Ou un composant de chargement
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Toaster position="top-right" />
      
      <Routes>
        {/* Route de connexion (accessible à tous) */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        
        {/* Routes protégées */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Routes protégées par rôle */}
          <Route
            path="users/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Users />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="classes"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <Classes />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="subjects"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <Subjects />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="courses"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <Courses />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="grades"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <Grades />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="attendance"
            element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <Attendance />
              </ProtectedRoute>
            }
          />
          
          {/* Route de profil (accessible à tous les utilisateurs connectés) */}
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* Route 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Box>
  );
}

// Composant racine de l'application
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
