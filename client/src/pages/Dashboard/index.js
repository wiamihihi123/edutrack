import React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  Container,
  useTheme,
  useMediaQuery,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  LinearProgress,
  Button
} from '@mui/material';
import {
  People as PeopleIcon,
  Class as ClassIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  EventAvailable as EventAvailableIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <Card elevation={3} sx={{ height: '100%', borderRadius: 2, overflow: 'hidden' }}>
      <Box display="flex" alignItems="center" p={3}>
        <Box 
          sx={{ 
            backgroundColor: `${color}20`, 
            borderRadius: '12px', 
            width: 56, 
            height: 56, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mr: 2,
            flexShrink: 0
          }}
        >
          <Icon sx={{ color: color, fontSize: 28 }} />
        </Box>
        <Box>
          <Typography color="textSecondary" variant="subtitle2" fontWeight={500}>
            {title}
          </Typography>
          <Box display="flex" alignItems="baseline">
            <Typography variant="h4" component="div" fontWeight={600}>
              {value}
            </Typography>
            {trend && (
              <Typography 
                variant="caption" 
                color={trend.color} 
                sx={{ 
                  ml: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: 500
                }}
              >
                {trend.icon}
                {trend.value}%
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

const ActivityItem = ({ icon: Icon, primary, secondary, color }) => (
  <ListItem sx={{ px: 0 }}>
    <ListItemIcon sx={{ minWidth: 40 }}>
      <Icon sx={{ color: color }} />
    </ListItemIcon>
    <ListItemText 
      primary={primary}
      secondary={secondary}
      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
      secondaryTypographyProps={{ variant: 'caption' }}
    />
  </ListItem>
);

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Données factices pour l'exemple
  const stats = [
    { 
      title: 'Étudiants', 
      value: '1,254', 
      icon: PeopleIcon, 
      color: theme.palette.primary.main,
      trend: { value: 12.5, color: theme.palette.success.main, icon: '↑' }
    },
    { 
      title: 'Enseignants', 
      value: '42', 
      icon: SchoolIcon, 
      color: theme.palette.success.main,
      trend: { value: 5.2, color: theme.palette.success.main, icon: '↑' }
    },
    { 
      title: 'Classes', 
      value: '36', 
      icon: ClassIcon, 
      color: theme.palette.warning.main,
      trend: { value: 2.8, color: theme.palette.success.main, icon: '↑' }
    },
    { 
      title: 'Cours', 
      value: '128', 
      icon: AssignmentIcon, 
      color: theme.palette.error.main,
      trend: { value: 8.3, color: theme.palette.success.main, icon: '↑' }
    },
  ];

  const activities = [
    { 
      icon: CheckCircleIcon, 
      primary: 'Nouvelle inscription', 
      secondary: '5 minutes ago',
      color: theme.palette.success.main
    },
    { 
      icon: WarningIcon, 
      primary: 'Maintenance planifiée', 
      secondary: 'Il y a 2 heures',
      color: theme.palette.warning.main
    },
    { 
      icon: ErrorIcon, 
      primary: 'Problème de connexion', 
      secondary: 'Il y a 5 heures',
      color: theme.palette.error.main
    },
    { 
      icon: InfoIcon, 
      primary: 'Mise à jour disponible', 
      secondary: 'Hier',
      color: theme.palette.info.main
    },
  ];

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
        {/* En-tête */}
        <Box 
          mb={{ xs: 3, md: 4 }}
          textAlign={{ xs: 'center', sm: 'left' }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight={700} 
            gutterBottom
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem' },
              lineHeight: 1.2
            }}
          >
            Tableau de bord
          </Typography>
          <Typography 
            color="textSecondary" 
            variant="subtitle1"
            sx={{
              maxWidth: '600px',
              mx: { xs: 'auto', sm: 0 },
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            Aperçu des activités et des statistiques
          </Typography>
        </Box>

        {/* Grille des statistiques */}
        <Box mb={{ xs: 3, md: 4 }}>
          <Grid container spacing={3} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard 
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                  trend={stat.trend}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Contenu principal */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Grid container spacing={3} sx={{ flex: 1 }}>
            {/* Graphique de présence */}
            <Grid item xs={12} lg={8}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box display="flex" alignItems="center">
                    <EventAvailableIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Taux de présence
                    </Typography>
                  </Box>
                  <Button 
                    size="small" 
                    color="primary"
                    sx={{ textTransform: 'none' }}
                  >
                    Voir tout
                  </Button>
                </Box>
                
                <Box height={300} display="flex" flexDirection="column" justifyContent="center">
                  <Box mb={3}>
                    <Typography variant="h3" component="div" textAlign="center" fontWeight={700}>
                      94.5%
                    </Typography>
                    <Typography color="textSecondary" textAlign="center">
                      Taux de présence moyen ce mois-ci
                    </Typography>
                  </Box>
                  
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, i) => (
                    <Box key={day} mb={1}>
                      <Box display="flex" alignItems="center" mb={0.5}>
                        <Typography variant="caption" color="textSecondary" sx={{ width: 40 }}>
                          {day}
                        </Typography>
                        <Box width="100%" mr={2}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(100, 70 + Math.random() * 30)} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 5,
                              backgroundColor: theme.palette.grey[200],
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 5,
                                backgroundColor: theme.palette.primary.main
                              }
                            }} 
                          />
                        </Box>
                        <Typography variant="caption" color="textSecondary" sx={{ width: 40, textAlign: 'right' }}>
                          {Math.floor(70 + Math.random() * 30)}%
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Activités récentes */}
            <Grid item xs={12} lg={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box display="flex" alignItems="center">
                    <TimelineIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Activités récentes
                    </Typography>
                  </Box>
                  <Button 
                    size="small" 
                    color="primary"
                    sx={{ textTransform: 'none' }}
                  >
                    Tout voir
                  </Button>
                </Box>
                
                <List disablePadding>
                  {activities.map((activity, index) => (
                    <React.Fragment key={index}>
                      <ActivityItem 
                        icon={activity.icon}
                        primary={activity.primary}
                        secondary={activity.secondary}
                        color={activity.color}
                      />
                      {index < activities.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;