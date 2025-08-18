import React, { useState } from 'react';
import {
  Container, Box, Typography, Paper, Avatar, Button, TextField,
  IconButton, Divider, Grid, Card, CardContent, useTheme,
  useMediaQuery, Tabs, Tab, InputAdornment, Alert, Snackbar, Chip
} from '@mui/material';
import {
  Edit as EditIcon, Save as SaveIcon, Lock as LockIcon,
  Email as EmailIcon, Person as PersonIcon, School as SchoolIcon,
  Phone as PhoneIcon, LocationOn as LocationIcon, CalendarToday as CalendarIcon
} from '@mui/icons-material';

// Données factices de l'utilisateur
const userData = {
  id: 1,
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@example.com',
  role: 'Enseignant',
  phone: '+33 6 12 34 56 78',
  address: '123 Rue de l\'Éducation, 75000 Paris',
  bio: 'Professeur de mathématiques passionné par l\'enseignement.',
  subjects: ['Mathématiques', 'Physique'],
  classes: ['Terminale S1', 'Première S1']
};

// Composant pour afficher les détails
const DetailItem = ({ icon, label, value }) => (
  <Grid item xs={12} sm={6}>
    <Box display="flex" alignItems="flex-start" mb={2}>
      <Box mr={2} mt={0.5} color="text.secondary">
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="textSecondary" display="block">
          {label}
        </Typography>
        <Typography variant="body1">
          {value || 'Non renseigné'}
        </Typography>
      </Box>
    </Box>
  </Grid>
);

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // États
  const [user, setUser] = useState(userData);
  const [isEditing, setIsEditing] = useState(false);
  const [tabValue, setTabValue] = useState('info');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Gestion des onglets
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Activer/désactiver le mode édition
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Gestion des changements des champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Sauvegarder les modifications
  const handleSave = () => {
    // Ici, vous enverriez les données mises à jour à l'API
    console.log('Données mises à jour :', user);
    setIsEditing(false);
    showSnackbar('Profil mis à jour avec succès', 'success');
  };

  // Afficher une notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Fermer la notification
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        pt: 4, 
        pb: 4,
        ml: '240px', 
        width: 'calc(100% - 240px)', 
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 'calc(100vh - 64px)', 
        padding: theme.spacing(3),
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[1]
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Mon Profil
            </Typography>
            <Typography color="textSecondary" variant="subtitle1">
              Gérez vos informations personnelles
            </Typography>
          </Box>
          {!isEditing && tabValue === 'info' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={toggleEdit}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Modifier le profil
            </Button>
          )}
        </Box>

        <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
          <Box 
            sx={{
              height: 100,
              bgcolor: 'primary.main',
              position: 'relative',
              mb: 10
            }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                bottom: -60,
                border: '4px solid white',
                bgcolor: 'primary.dark',
                fontSize: 40,
                fontWeight: 'bold'
              }}
            >
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </Avatar>
          </Box>

          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': {
                height: 4,
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
              },
            }}
          >
            <Tab 
              value="info" 
              label="Informations" 
              icon={<PersonIcon />} 
              iconPosition="start"
              sx={{ py: 2, minHeight: 'auto' }}
            />
            <Tab 
              value="security" 
              label="Sécurité" 
              icon={<LockIcon />} 
              iconPosition="start"
              sx={{ py: 2, minHeight: 'auto' }}
            />
          </Tabs>

          <Divider />

          {tabValue === 'info' ? (
            <Box p={isMobile ? 2 : 4}>
              {isEditing ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      name="firstName"
                      value={user.firstName}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nom"
                      name="lastName"
                      value={user.lastName}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={user.email}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Téléphone"
                      name="phone"
                      value={user.phone}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Adresse"
                      name="address"
                      value={user.address}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                      <Button
                        variant="outlined"
                        onClick={toggleEdit}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        Enregistrer
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={4}>
                  <Grid item xs={12} md={8}>
                    <Box mb={4} textAlign={isMobile ? 'center' : 'left'}>
                      <Typography variant="h5" gutterBottom fontWeight={600}>
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                        {user.role}
                      </Typography>
                      <Typography variant="body1" mt={2}>
                        {user.bio}
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <DetailItem 
                        icon={<EmailIcon />} 
                        label="Email" 
                        value={user.email} 
                      />
                      <DetailItem 
                        icon={<PhoneIcon />} 
                        label="Téléphone" 
                        value={user.phone} 
                      />
                      <DetailItem 
                        icon={<LocationIcon />} 
                        label="Adresse" 
                        value={user.address} 
                      />
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          Matières enseignées
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                          {user.subjects.map((subject, index) => (
                            <Chip 
                              key={index} 
                              label={subject} 
                              color="primary" 
                              variant="outlined"
                              size="small"
                              icon={<SchoolIcon />}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                    
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          Classes assignées
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={1} mt={2}>
                          {user.classes.map((cls, index) => (
                            <Box 
                              key={index} 
                              display="flex" 
                              alignItems="center" 
                              gap={1}
                              p={1}
                              sx={{
                                borderRadius: 1,
                                '&:hover': {
                                  bgcolor: 'action.hover'
                                }
                              }}
                            >
                              <SchoolIcon color="primary" fontSize="small" />
                              <Typography variant="body2">
                                {cls}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </Box>
          ) : (
            <Box p={isMobile ? 2 : 4}>
              <Typography variant="h6" gutterBottom>
                Changer le mot de passe
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Pour modifier votre mot de passe, veuillez contacter l'administrateur.
              </Typography>
            </Box>
          )}
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default Profile;
