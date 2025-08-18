import React, { useState } from 'react';
import {
  Box, Container, Typography, Paper, Button, TextField, InputAdornment,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  DialogContentText, Chip, Avatar, useTheme, useMediaQuery, Tabs, 
  Tab, Card, CardContent, Grid, LinearProgress, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel,
  FormControl, InputLabel, Select, MenuItem, Tooltip, Divider
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, MoreVert as MoreVertIcon,
  Edit as EditIcon, Delete as DeleteIcon, FilterList as FilterListIcon,
  School as SchoolIcon, Book as BookIcon, Sort as SortIcon,
  ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon,
  CheckCircle as CheckCircleIcon, Schedule as ScheduleIcon,
  People as PeopleIcon, Assessment as AssessmentIcon
} from '@mui/icons-material';

// Données factices
const courses = [
  { 
    id: 1, 
    title: 'Introduction aux algorithmes', 
    code: 'ALG101', 
    subject: 'Informatique', 
    teacher: 'Prof. Martin',
    students: 24,
    status: 'active',
    startDate: '2024-09-01',
    endDate: '2024-12-15',
    description: 'Ce cours introduit les concepts fondamentaux des algorithmes et de la complexité.'
  },
  { 
    id: 2, 
    title: 'Mathématiques avancées', 
    code: 'MATH201', 
    subject: 'Mathématiques', 
    teacher: 'Prof. Dupont',
    students: 18,
    status: 'active',
    startDate: '2024-09-01',
    endDate: '2024-12-15',
    description: 'Approfondissement des concepts mathématiques pour les sciences de l\'ingénieur.'
  },
  { 
    id: 3, 
    title: 'Physique quantique', 
    code: 'PHY301', 
    subject: 'Physique', 
    teacher: 'Prof. Einstein',
    students: 15,
    status: 'upcoming',
    startDate: '2025-01-10',
    endDate: '2025-04-30',
    description: 'Introduction aux principes fondamentaux de la mécanique quantique.'
  },
];

const Courses = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [tabValue, setTabValue] = useState('list');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('title');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleTabChange = (event, newValue) => setTabValue(newValue);
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleOpenDialog = (course = null) => {
    setSelectedCourse(course);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourse(null);
  };

  const filteredCourses = courses
    .filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(course => selectedSubject === 'all' || course.subject === selectedSubject)
    .sort((a, b) => {
      if (orderBy === 'title') {
        return order === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (orderBy === 'code') {
        return order === 'asc' 
          ? a.code.localeCompare(b.code)
          : b.code.localeCompare(a.code);
      } else if (orderBy === 'teacher') {
        return order === 'asc'
          ? a.teacher.localeCompare(b.teacher)
          : b.teacher.localeCompare(a.teacher);
      }
      return 0;
    });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'upcoming': return 'info';
      case 'completed': return 'secondary';
      default: return 'default';
    }
  };

  const subjects = [...new Set(courses.map(course => course.subject))];

  return (
    <Container maxWidth="xl" sx={{ py: 4, ml: { sm: '240px' }, width: { sm: 'calc(100% - 240px)' } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Gestion des cours
          </Typography>
          <Typography color="textSecondary" variant="subtitle1">
            Consultez et gérez les cours de l'établissement
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Nouveau cours
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, p: 3, borderRadius: 2 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mb={3}>
          <TextField
            variant="outlined"
            placeholder="Rechercher un cours..."
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
          
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Matière</InputLabel>
            <Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              label="Matière"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">Toutes les matières</MenuItem>
              {subjects.map((subject, index) => (
                <MenuItem key={index} value={subject}>
                  {subject}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box flexGrow={1} display="flex" justifyContent="flex-end">
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              indicatorColor="primary"
              textColor="primary"
              sx={{
                '& .MuiTabs-flexContainer': {
                  gap: 1,
                },
              }}
            >
              <Tab value="list" label="Liste" />
              <Tab value="stats" label="Statistiques" />
            </Tabs>
          </Box>
        </Box>

        {tabValue === 'list' && (
          <>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'code'}
                        direction={orderBy === 'code' ? order : 'asc'}
                        onClick={() => handleRequestSort('code')}
                      >
                        Code
                        {orderBy === 'code' ? (
                          order === 'desc' ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />
                        ) : <SortIcon sx={{ opacity: 0.3 }} />}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'title'}
                        direction={orderBy === 'title' ? order : 'asc'}
                        onClick={() => handleRequestSort('title')}
                      >
                        Titre du cours
                        {orderBy === 'title' ? (
                          order === 'desc' ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />
                        ) : <SortIcon sx={{ opacity: 0.3 }} />}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Matière</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'teacher'}
                        direction={orderBy === 'teacher' ? order : 'asc'}
                        onClick={() => handleRequestSort('teacher')}
                      >
                        Enseignant
                        {orderBy === 'teacher' ? (
                          order === 'desc' ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />
                        ) : <SortIcon sx={{ opacity: 0.3 }} />}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center">Étudiants</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCourses
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((course) => (
                      <TableRow key={course.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {course.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">{course.title}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {course.startDate} - {course.endDate}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={course.subject} 
                            size="small" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar 
                              sx={{ 
                                width: 28, 
                                height: 28, 
                                mr: 1.5,
                                bgcolor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                fontSize: 12,
                                fontWeight: 'bold'
                              }}
                            >
                              {course.teacher.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Typography variant="body2">{course.teacher}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center">
                            <PeopleIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">{course.students}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={course.status === 'active' ? 'Actif' : course.status === 'upcoming' ? 'À venir' : 'Terminé'} 
                            size="small" 
                            color={getStatusColor(course.status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleOpenDialog(course)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small">
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredCourses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
              }
            />
          </>
        )}

        {tabValue === 'stats' && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Répartition par matière
                </Typography>
                <Box mt={2}>
                  {subjects.map((subject, index) => {
                    const count = courses.filter(c => c.subject === subject).length;
                    const percentage = (count / courses.length) * 100;
                    return (
                      <Box key={index} mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2">
                            {subject}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {count} cours
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: [
                                theme.palette.primary.main,
                                theme.palette.secondary.main,
                                theme.palette.success.main,
                                theme.palette.warning.main,
                                theme.palette.error.main,
                              ][index % 5]
                            }
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Statut des cours
                </Typography>
                <Box display="flex" justifyContent="center" mt={4}>
                  <Box width={200} height={200} position="relative">
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      width="100%"
                      height="100%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexDirection="column"
                    >
                      <Typography variant="h4">
                        {courses.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" align="center">
                        Cours au total
                      </Typography>
                    </Box>
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={theme.palette.grey[200]}
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={theme.palette.primary.main}
                        strokeWidth="10"
                        strokeDasharray={`${(courses.filter(c => c.status === 'active').length / courses.length) * 283} 283`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                  </Box>
                </Box>
                <Box display="flex" justifyContent="center" mt={2} gap={2} flexWrap="wrap">
                  <Box display="flex" alignItems="center">
                    <Box width={12} height={12} bgcolor={theme.palette.primary.main} borderRadius="50%" mr={1} />
                    <Typography variant="body2">
                      {courses.filter(c => c.status === 'active').length} Actifs
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Box width={12} height={12} bgcolor={theme.palette.info.main} borderRadius="50%" mr={1} />
                    <Typography variant="body2">
                      {courses.filter(c => c.status === 'upcoming').length} À venir
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Box width={12} height={12} bgcolor={theme.palette.grey[400]} borderRadius="50%" mr={1} />
                    <Typography variant="body2">
                      {courses.filter(c => c.status === 'completed').length} Terminés
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Dialogue d'édition/ajout de cours */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCourse ? 'Modifier le cours' : 'Nouveau cours'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            {selectedCourse 
              ? 'Modifiez les informations du cours ci-dessous.'
              : 'Remplissez les informations pour créer un nouveau cours.'}
          </DialogContentText>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                autoFocus
                margin="dense"
                label="Code du cours"
                type="text"
                fullWidth
                variant="outlined"
                defaultValue={selectedCourse?.code || ''}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Titre du cours"
                type="text"
                fullWidth
                variant="outlined"
                defaultValue={selectedCourse?.title || ''}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Matière</InputLabel>
                <Select
                  label="Matière"
                  defaultValue={selectedCourse?.subject || ''}
                >
                  {subjects.map((subject, index) => (
                    <MenuItem key={index} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Enseignant"
                type="text"
                fullWidth
                variant="outlined"
                defaultValue={selectedCourse?.teacher || ''}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Date de début"
                type="date"
                fullWidth
                variant="outlined"
                defaultValue={selectedCourse?.startDate || ''}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Date de fin"
                type="date"
                fullWidth
                variant="outlined"
                defaultValue={selectedCourse?.endDate || ''}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Description"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                defaultValue={selectedCourse?.description || ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>
            Annuler
          </Button>
          <Button 
            onClick={handleCloseDialog} 
            variant="contained" 
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            {selectedCourse ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Courses;