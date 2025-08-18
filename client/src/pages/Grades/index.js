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
  Assessment as AssessmentIcon, BarChart as BarChartIcon, Timeline as TimelineIcon,
  ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon,
  School as SchoolIcon, Book as BookIcon, Sort as SortIcon,
  Person as PersonIcon, Class as ClassIcon, Subject as SubjectIcon
} from '@mui/icons-material';

// Données factices
const students = [
  { id: 1, name: 'Jean Dupont', class: 'Terminale S1', status: 'active' },
  { id: 2, name: 'Marie Martin', class: 'Terminale S1', status: 'active' },
  { id: 3, name: 'Pierre Durand', class: 'Terminale S1', status: 'active' },
  { id: 4, name: 'Sophie Bernard', class: 'Terminale S1', status: 'active' },
  { id: 5, name: 'Thomas Leroy', class: 'Terminale S2', status: 'active' },
  { id: 6, name: 'Julie Petit', class: 'Terminale S2', status: 'active' },
  { id: 7, name: 'Nicolas Moreau', class: 'Terminale S2', status: 'active' },
];

const subjects = [
  { id: 1, name: 'Mathématiques', code: 'MATH', coefficient: 4 },
  { id: 2, name: 'Français', code: 'FR', coefficient: 3 },
  { id: 3, name: 'Anglais', code: 'ANG', coefficient: 2 },
  { id: 4, name: 'Physique-Chimie', code: 'PHYS', coefficient: 4 },
  { id: 5, name: 'SVT', code: 'SVT', coefficient: 3 },
];

const classes = ['Terminale S1', 'Terminale S2', 'Première S1', 'Première S2'];

const generateGrades = () => {
  const grades = [];
  students.forEach(student => {
    subjects.forEach(subject => {
      if (Math.random() < 0.7) {
        grades.push({
          id: `${student.id}-${subject.id}`,
          studentId: student.id,
          subjectId: subject.id,
          value: (Math.random() * 20).toFixed(2),
          date: new Date(2024, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1),
          type: ['DS', 'Interro', 'DM', 'Oral', 'TP'][Math.floor(Math.random() * 5)],
          comment: Math.random() > 0.7 ? 'Très bon travail' : Math.random() > 0.4 ? 'Peut mieux faire' : ''
        });
      }
    });
  });
  return grades;
};

const gradesData = generateGrades();

const Grades = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [tabValue, setTabValue] = useState('list');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleTabChange = (event, newValue) => setTabValue(newValue);
  
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleOpenDialog = (student = null, subject = null) => {
    setSelectedStudent(student);
    setSelectedGrade(subject ? gradesData.find(g => g.studentId === student?.id && g.subjectId === subject?.id) : null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setSelectedGrade(null);
  };

  const filteredStudents = students
    .filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(student => selectedClass === 'all' || student.class === selectedClass)
    .sort((a, b) => {
      if (orderBy === 'name') {
        return order === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (orderBy === 'class') {
        return order === 'asc' 
          ? a.class.localeCompare(b.class)
          : b.class.localeCompare(a.class);
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

  const getGradeColor = (grade) => {
    if (!grade) return 'default';
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade)) return 'default';
    if (numGrade < 8) return 'error';
    if (numGrade < 12) return 'warning';
    return 'success';
  };

  const getStudentSubjectGrade = (studentId, subjectId) => {
    return gradesData.find(g => g.studentId === studentId && g.subjectId === subjectId);
  };

  const getStudentAverage = (studentId) => {
    const studentGrades = gradesData.filter(g => g.studentId === studentId);
    if (studentGrades.length === 0) return 'N/A';
    
    const total = studentGrades.reduce((sum, grade) => {
      const subject = subjects.find(s => s.id === grade.subjectId);
      return sum + (parseFloat(grade.value) * (subject?.coefficient || 1));
    }, 0);
    
    const totalCoeff = studentGrades.reduce((sum, grade) => {
      const subject = subjects.find(s => s.id === grade.subjectId);
      return sum + (subject?.coefficient || 1);
    }, 0);
    
    return (total / totalCoeff).toFixed(2);
  };

  const getSubjectAverage = (subjectId) => {
    const subjectGrades = gradesData.filter(g => g.subjectId === subjectId);
    if (subjectGrades.length === 0) return 0;
    
    const sum = subjectGrades.reduce((acc, grade) => acc + parseFloat(grade.value), 0);
    return (sum / subjectGrades.length).toFixed(2);
  };

  const getClassAverage = () => {
    if (filteredStudents.length === 0) return 0;
    
    const sum = filteredStudents.reduce((acc, student) => {
      const avg = getStudentAverage(student.id);
      return acc + (avg === 'N/A' ? 0 : parseFloat(avg));
    }, 0);
    
    return (sum / filteredStudents.filter(s => getStudentAverage(s.id) !== 'N/A').length || 1).toFixed(2);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, ml: { sm: '240px' }, width: { sm: 'calc(100% - 240px)' } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Gestion des notes
          </Typography>
          <Typography color="textSecondary" variant="subtitle1">
            Consultez et gérez les notes des étudiants
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
            Saisir des notes
          </Button>
        </Box>
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
          
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Classe</InputLabel>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              label="Classe"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">Toutes les classes</MenuItem>
              {classes.map((cls, index) => (
                <MenuItem key={index} value={cls}>
                  {cls}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Matière</InputLabel>
            <Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              label="Matière"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">Toutes les matières</MenuItem>
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.name}
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
                        active={orderBy === 'name'}
                        direction={orderBy === 'name' ? order : 'asc'}
                        onClick={() => handleRequestSort('name')}
                      >
                        Étudiant
                        {orderBy === 'name' ? (
                          order === 'desc' ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />
                        ) : <SortIcon sx={{ opacity: 0.3 }} />}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'class'}
                        direction={orderBy === 'class' ? order : 'asc'}
                        onClick={() => handleRequestSort('class')}
                      >
                        Classe
                        {orderBy === 'class' ? (
                          order === 'desc' ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />
                        ) : <SortIcon sx={{ opacity: 0.3 }} />}
                      </TableSortLabel>
                    </TableCell>
                    {subjects
                      .filter(subject => selectedSubject === 'all' || subject.id === selectedSubject)
                      .map((subject) => (
                        <TableCell key={subject.id} align="center">
                          <Tooltip title={`${subject.name} (Coef. ${subject.coefficient})`}>
                            <Box sx={{ cursor: 'pointer' }}>
                              <Typography variant="caption" display="block">
                                {subject.code}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {getSubjectAverage(subject.id)}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </TableCell>
                      ))}
                    <TableCell align="center">Moyenne</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student) => {
                      const studentAverage = getStudentAverage(student.id);
                      return (
                        <TableRow key={student.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  mr: 1.5,
                                  bgcolor: theme.palette.primary.main,
                                  color: theme.palette.primary.contrastText,
                                  fontSize: 12,
                                  fontWeight: 'bold'
                                }}
                              >
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                              <Typography variant="body2">{student.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={student.class} 
                              size="small" 
                              variant="outlined"
                              icon={<ClassIcon fontSize="small" />}
                            />
                          </TableCell>
                          
                          {subjects
                            .filter(subject => selectedSubject === 'all' || subject.id === selectedSubject)
                            .map((subject) => {
                              const grade = getStudentSubjectGrade(student.id, subject.id);
                              return (
                                <TableCell key={subject.id} align="center">
                                  {grade ? (
                                    <Tooltip 
                                      title={
                                        <>
                                          <div>Type: {grade.type}</div>
                                          <div>Date: {new Date(grade.date).toLocaleDateString()}</div>
                                          {grade.comment && <div>Commentaire: {grade.comment}</div>}
                                        </>
                                      }
                                    >
                                      <Chip
                                        label={grade.value}
                                        size="small"
                                        color={getGradeColor(grade.value)}
                                        variant="outlined"
                                        onClick={() => handleOpenDialog(student, subject)}
                                        sx={{ cursor: 'pointer' }}
                                      />
                                    </Tooltip>
                                  ) : (
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleOpenDialog(student, subject)}
                                    >
                                      <AddIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </TableCell>
                              );
                            })}
                          
                          <TableCell align="center">
                            <Chip
                              label={studentAverage}
                              color={studentAverage === 'N/A' ? 'default' : getGradeColor(studentAverage)}
                              variant="filled"
                              size="small"
                              sx={{ 
                                minWidth: 50,
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          
                          <TableCell>
                            <IconButton size="small" onClick={() => handleOpenDialog(student)}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredStudents.length}
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
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Répartition des notes
                </Typography>
                <Box mt={2}>
                  {['0-7.9', '8-11.9', '12-20'].map((range, index) => {
                    const [min, max] = range.split('-').map(Number);
                    const count = gradesData.filter(g => {
                      const val = parseFloat(g.value);
                      return val >= min && val <= (max || 20);
                    }).length;
                    const percentage = (count / gradesData.length) * 100 || 0;
                    
                    return (
                      <Box key={index} mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2">
                            {range}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {count} notes
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
                                theme.palette.error.main,
                                theme.palette.warning.main,
                                theme.palette.success.main,
                              ][index]
                            }
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Moyennes par matière
                </Typography>
                <Box mt={2}>
                  {subjects.map((subject, index) => {
                    const avg = getSubjectAverage(subject.id);
                    return (
                      <Box key={subject.id} mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2">
                            {subject.name}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {avg}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={(avg / 20) * 100} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getGradeColor(avg)
                            }
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Vue d'ensemble
                </Typography>
                <Grid container spacing={2} mt={1}>
                  <Grid item xs={6}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                      <Typography variant="h4" color="primary">
                        {filteredStudents.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Étudiants
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                      <Typography variant="h4" color="secondary">
                        {subjects.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Matières
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: theme.palette.success.main }}>
                        {getClassAverage()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Moyenne de la classe
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Dialogue d'édition/ajout de note */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedGrade ? 'Modifier une note' : 'Ajouter une note'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            {selectedStudent && selectedGrade
              ? `Modifiez la note de ${selectedStudent.name} en ${subjects.find(s => s.id === selectedGrade.subjectId)?.name || 'cette matière'}.`
              : selectedStudent
              ? `Ajoutez une note pour ${selectedStudent.name}${selectedSubject !== 'all' ? ` en ${subjects.find(s => s.id === parseInt(selectedSubject))?.name || 'cette matière'}` : ''}.`
              : 'Sélectionnez un étudiant et une matière pour ajouter une note.'}
          </DialogContentText>
          
          <Grid container spacing={2}>
            {!selectedStudent && (
              <Grid item xs={12}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Étudiant</InputLabel>
                  <Select
                    label="Étudiant"
                    value=""
                    onChange={(e) => setSelectedStudent(students.find(s => s.id === e.target.value))}
                  >
                    {filteredStudents.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.name} - {student.class}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            {selectedStudent && (!selectedGrade || selectedSubject === 'all') && (
              <Grid item xs={12}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Matière</InputLabel>
                  <Select
                    label="Matière"
                    value={selectedSubject !== 'all' ? selectedSubject : ''}
                    onChange={(e) => {
                      const subjectId = e.target.value;
                      const grade = gradesData.find(g => g.studentId === selectedStudent.id && g.subjectId === subjectId);
                      setSelectedGrade(grade || null);
                    }}
                  >
                    {subjects
                      .filter(subject => selectedSubject === 'all' || subject.id === selectedSubject)
                      .map((subject) => (
                        <MenuItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            {(selectedGrade || (selectedStudent && selectedSubject !== 'all')) && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    margin="dense"
                    label="Note"
                    type="number"
                    fullWidth
                    variant="outlined"
                    defaultValue={selectedGrade?.value || ''}
                    inputProps={{
                      step: 0.25,
                      min: 0,
                      max: 20,
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">/20</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Type d'évaluation</InputLabel>
                    <Select
                      label="Type d'évaluation"
                      defaultValue={selectedGrade?.type || 'DS'}
                    >
                      <MenuItem value="DS">Devoir surveillé</MenuItem>
                      <MenuItem value="Interro">Interrogation</MenuItem>
                      <MenuItem value="DM">Devoir maison</MenuItem>
                      <MenuItem value="Oral">Oral</MenuItem>
                      <MenuItem value="TP">Travaux pratiques</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    margin="dense"
                    label="Date"
                    type="date"
                    fullWidth
                    variant="outlined"
                    defaultValue={selectedGrade?.date ? new Date(selectedGrade.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    margin="dense"
                    label="Commentaire"
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    defaultValue={selectedGrade?.comment || ''}
                  />
                </Grid>
              </>
            )}
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
            disabled={!selectedStudent || (!selectedGrade && selectedSubject === 'all')}
          >
            {selectedGrade ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Grades;