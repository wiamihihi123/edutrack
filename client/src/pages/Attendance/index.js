import React, { useState } from 'react';
import {
  Box, Container, Typography, Paper, Button, TextField, InputAdornment,
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, Avatar, FormControl, InputLabel, Select, useTheme,
  useMediaQuery, Card, CardContent, Grid, LinearProgress, Tabs, Tab
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon, Schedule as ScheduleIcon, Close as CloseIcon,
  BarChart as BarChartIcon, CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';

// Données factices
const students = [
  { id: 1, name: 'walid ihihi', class: 'Terminale S1' },
  { id: 2, name: 'zineb assouli', class: 'Terminale S1' },
  { id: 3, name: 'khaled amal', class: 'Terminale S1' },
];

const Attendance = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendances, setAttendances] = useState(
    students.map(student => ({
      id: student.id,
      status: Math.random() > 0.3 ? 'present' : (Math.random() > 0.5 ? 'late' : 'absent'),
    }))
  );

  // Mettre à jour le statut de présence
  const updateAttendance = (studentId, status) => {
    setAttendances(prev => 
      prev.map(att => 
        att.id === studentId ? { ...att, status } : att
      )
    );
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'absent': return 'error';
      default: return 'default';
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'present': return 'Présent';
      case 'late': return 'En retard';
      case 'absent': return 'Absent';
      default: return 'Non renseigné';
    }
  };

  // Statistiques
  const stats = {
    total: students.length,
    present: attendances.filter(a => a.status === 'present').length,
    late: attendances.filter(a => a.status === 'late').length,
    absent: attendances.filter(a => a.status === 'absent').length,
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
              Gestion des présences
            </Typography>
            <Typography color="textSecondary" variant="subtitle1">
              Enregistrez et consultez les présences
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Nouvelle entrée
          </Button>
        </Box>

        <Paper sx={{ mb: 3, p: 3, borderRadius: 2 }}>
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mb={3}>
            <TextField
              variant="outlined"
              placeholder="Rechercher un étudiant..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 2, 
                  minWidth: isMobile ? '100%' : 300
                }
              }}
            />
            
            <TextField
              type="date"
              size="small"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              sx={{ width: 180, '& .MuiInputBase-input': { py: '8.5px' } }}
            />
          </Box>

          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Taux de présence
                </Typography>
                <Box display="flex" alignItems="center">
                  <CheckCircleIcon 
                    color="success" 
                    sx={{ 
                      mr: 1,
                      fontSize: 40,
                      color: theme.palette.success.main
                    }} 
                  />
                  <Box>
                    <Typography variant="h4">
                      {Math.round((stats.present / stats.total) * 100)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {stats.present} sur {stats.total} étudiants
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={9}>
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Répartition des présences
                </Typography>
                <Box display="flex" alignItems="flex-end" height={80} mt={2} gap={1}>
                  <Box flex={1} textAlign="center">
                    <Box 
                      sx={{
                        height: `${(stats.present / stats.total) * 60}%`,
                        bgcolor: 'success.main',
                        borderRadius: '4px 4px 0 0',
                        mb: 0.5
                      }}
                    />
                    <Typography variant="caption" display="block">
                      Présents
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.present}
                    </Typography>
                  </Box>
                  
                  <Box flex={1} textAlign="center">
                    <Box 
                      sx={{
                        height: `${(stats.late / stats.total) * 60}%`,
                        bgcolor: 'warning.main',
                        borderRadius: '4px 4px 0 0',
                        mb: 0.5
                      }}
                    />
                    <Typography variant="caption" display="block">
                      En retard
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.late}
                    </Typography>
                  </Box>
                  
                  <Box flex={1} textAlign="center">
                    <Box 
                      sx={{
                        height: `${(stats.absent / stats.total) * 60}%`,
                        bgcolor: 'error.main',
                        borderRadius: '4px 4px 0 0',
                        mb: 0.5
                      }}
                    />
                    <Typography variant="caption" display="block">
                      Absents
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.absent}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Étudiant</TableCell>
                  <TableCell align="center">Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => {
                  const attendance = attendances.find(a => a.id === student.id);
                  
                  return (
                    <TableRow key={student.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar 
                            sx={{ 
                              width: 36, 
                              height: 36, 
                              mr: 2,
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                              fontSize: 14,
                              fontWeight: 'bold'
                            }}
                          >
                            {student.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{student.name}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {student.class}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Chip
                          label={getStatusLabel(attendance?.status)}
                          color={getStatusColor(attendance?.status)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end" gap={1}>
                          <Button
                            size="small"
                            variant={attendance?.status === 'present' ? 'contained' : 'outlined'}
                            color="success"
                            onClick={() => updateAttendance(student.id, 'present')}
                            sx={{ minWidth: 32, p: 0.5 }}
                          >
                            P
                          </Button>
                          <Button
                            size="small"
                            variant={attendance?.status === 'late' ? 'contained' : 'outlined'}
                            color="warning"
                            onClick={() => updateAttendance(student.id, 'late')}
                            sx={{ minWidth: 32, p: 0.5 }}
                          >
                            R
                          </Button>
                          <Button
                            size="small"
                            variant={attendance?.status === 'absent' ? 'contained' : 'outlined'}
                            color="error"
                            onClick={() => updateAttendance(student.id, 'absent')}
                            sx={{ minWidth: 32, p: 0.5 }}
                          >
                            A
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckCircleIcon />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Enregistrer les présences
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Attendance;