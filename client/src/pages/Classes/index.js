import React, { useState } from 'react';
import {
  Box, Container, Typography, Paper, Button, TextField, InputAdornment,
  IconButton, Menu, MenuItem, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, DialogContentText, ListItemIcon, ListItemText, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Chip, Avatar, Tooltip, FormControl, InputLabel, Select, Checkbox,
  useTheme, useMediaQuery, Tabs, Tab, Card, CardContent, CardActionArea, Grid, List
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  EventNote as EventNoteIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  GroupAdd as GroupAddIcon
} from '@mui/icons-material';

// Données factices pour l'exemple
const classesData = [
  {
    id: 1,
    name: 'Terminale S1',
    level: 'Terminale',
    section: 'Scientifique',
    students: 32,
    mainTeacher: 'Marie Martin',
    room: 'B101',
    schedule: 'Lun-Ven 8h-12h',
    status: 'active'
  },
  {
    id: 2,
    name: 'Première ES1',
    level: 'Première',
    section: 'Économique et Sociale',
    students: 28,
    mainTeacher: 'Pierre Durand',
    room: 'A205',
    schedule: 'Lun-Ven 13h-17h',
    status: 'active'
  },
  {
    id: 3,
    name: 'Seconde G1',
    level: 'Seconde',
    section: 'Générale',
    students: 30,
    mainTeacher: 'Sophie Petit',
    room: 'B103',
    schedule: 'Lun-Ven 8h-12h',
    status: 'active'
  },
  {
    id: 4,
    name: 'Terminale L1',
    level: 'Terminale',
    section: 'Littéraire',
    students: 24,
    mainTeacher: 'Lucas Moreau',
    room: 'A110',
    schedule: 'Lun-Ven 13h-17h',
    status: 'inactive'
  },
];

const mockStudents = [
  { id: 1, name: 'Jean Dupont', email: 'jean.dupont@example.com', status: 'active' },
  { id: 2, name: 'Marie Martin', email: 'marie.martin@example.com', status: 'active' },
  { id: 3, name: 'Pierre Durand', email: 'pierre.durand@example.com', status: 'inactive' },
];

const Classes = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [view, setView] = useState('grid');
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [selectedClassStudents, setSelectedClassStudents] = useState([]);
  const [addClassDialogOpen, setAddClassDialogOpen] = useState(false);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleMenuOpen = (event, classItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedClass(classItem);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClass(null);
  };

  const handleDeleteClick = (classItem) => {
    setClassToDelete(classItem);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    // Ici, vous ajouteriez la logique pour supprimer la classe
    console.log('Suppression de la classe :', classToDelete);
    setDeleteDialogOpen(false);
    setClassToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setClassToDelete(null);
  };

  const handleAddClassClick = () => {
    setAddClassDialogOpen(true);
  };

  const handleViewStudents = (classItem) => {
    setSelectedClass(classItem);
    // Ici, vous devriez faire un appel API pour récupérer les étudiants de la classe
    // Pour l'instant, on utilise des données factices
    setSelectedClassStudents(mockStudents);
    setStudentsDialogOpen(true);
  };

  const handleCloseStudentsDialog = () => {
    setStudentsDialogOpen(false);
    setSelectedClass(null);
    setSelectedClassStudents([]);
  };

  const handleCloseAddClassDialog = () => {
    setAddClassDialogOpen(false);
    // Réinitialiser le formulaire ici si nécessaire
  };

  const handleSaveClass = () => {
    // Logique pour sauvegarder la nouvelle classe
    // À implémenter avec votre logique de sauvegarde
    console.log('Nouvelle classe à sauvegarder');
    setAddClassDialogOpen(false);
  };

  const filteredClasses = classesData.filter((classItem) =>
    Object.values(classItem).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error';
  };

  const getStatusLabel = (status) => {
    return status === 'active' ? 'Active' : 'Inactive';
  };

  const getLevelColor = (level) => {
    const colors = {
      'Terminale': 'primary',
      'Première': 'secondary',
      'Seconde': 'info',
    };
    return colors[level] || 'default';
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
              Gestion des classes
            </Typography>
            <Typography color="textSecondary" variant="subtitle1">
              Gérez les classes et les groupes d'étudiants
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant={view === 'grid' ? 'contained' : 'outlined'}
              onClick={() => setView('grid')}
              size="small"
              sx={{ minWidth: 'auto' }}
            >
              Grille
            </Button>
            <Button
              variant={view === 'list' ? 'contained' : 'outlined'}
              onClick={() => setView('list')}
              size="small"
              sx={{ minWidth: 'auto' }}
            >
              Liste
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2, textTransform: 'none', ml: 1 }}
              onClick={handleAddClassClick}
            >
              Nouvelle classe
            </Button>
          </Box>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            mb: 3, 
            p: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mb={3}>
            <TextField
              variant="outlined"
              placeholder="Rechercher une classe..."
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 2, 
                  backgroundColor: 'background.paper',
                  minWidth: isMobile ? '100%' : 300
                }
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                ml: 'auto'
              }}
            >
              Filtres
            </Button>
          </Box>

          {view === 'grid' ? (
            <Grid container spacing={3}>
              {filteredClasses.map((classItem) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={classItem.id}>
                  <Card 
                    elevation={0}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                  >
                    <CardActionArea sx={{ flex: 1, p: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Chip
                          label={getStatusLabel(classItem.status)}
                          color={getStatusColor(classItem.status)}
                          size="small"
                          sx={{ 
                            fontWeight: 500,
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, classItem);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      <Box textAlign="center" mb={2}>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            mx: 'auto',
                            mb: 1,
                            bgcolor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            fontSize: 24,
                            fontWeight: 'bold'
                          }}
                        >
                          {classItem.name.charAt(0)}
                        </Avatar>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {classItem.name}
                        </Typography>
                        <Chip
                          label={classItem.level}
                          color={getLevelColor(classItem.level)}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box>
                        <Box display="flex" alignItems="center" mb={1}>
                          <PeopleIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="textSecondary">
                            {classItem.students} étudiants
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                          <SchoolIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="textSecondary" noWrap>
                            {classItem.mainTeacher}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <EventNoteIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="textSecondary">
                            {classItem.room}
                          </Typography>
                        </Box>
                      </Box>
                    </CardActionArea>
                    
                    <Box p={2} pt={0}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<GroupAddIcon />}
                        sx={{ borderRadius: 2 }}
                        onClick={() => handleViewStudents(classItem)}
                      >
                        Voir les étudiants
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box p={2} bgcolor="action.hover">
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Classe
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Niveau
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Étudiants
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={3}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Professeur
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Statut
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <List disablePadding>
                {filteredClasses.map((classItem) => (
                  <React.Fragment key={classItem.id}>
                    <Box 
                      p={2}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <Box display="flex" alignItems="center">
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                fontSize: 16,
                                fontWeight: 'bold',
                                mr: 2
                              }}
                            >
                              {classItem.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {classItem.name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {classItem.section}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={4} sm={2}>
                          <Chip
                            label={classItem.level}
                            color={getLevelColor(classItem.level)}
                            size="small"
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={4} sm={2}>
                          <Box display="flex" alignItems="center">
                            <PeopleIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              {classItem.students}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4} sm={3}>
                          <Typography variant="body2" noWrap>
                            {classItem.mainTeacher}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} sm={1}>
                          <Chip
                            label={getStatusLabel(classItem.status)}
                            color={getStatusColor(classItem.status)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4} sm={1} textAlign="right">
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleMenuOpen(e, classItem)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Box>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}
        </Paper>

        {/* Menu d'actions rapides */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={() => {
            handleViewStudents(selectedClass);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <PeopleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Voir les étudiants</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Modifier</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => selectedClass && handleDeleteClick(selectedClass)}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>Supprimer</ListItemText>
          </MenuItem>
        </Menu>

        {/* Boîte de dialogue de confirmation de suppression */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Confirmer la suppression
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Êtes-vous sûr de vouloir supprimer la classe <strong>{classToDelete?.name}</strong> ?
              Cette action est irréversible et affectera tous les étudiants de cette classe.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Annuler
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
              autoFocus
            >
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Boîte de dialogue des étudiants */}
        <Dialog
          open={studentsDialogOpen}
          onClose={handleCloseStudentsDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Étudiants de la classe {selectedClass?.name}
          </DialogTitle>
          <DialogContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="right">Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedClassStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={student.status === 'active' ? 'Actif' : 'Inactif'}
                          color={student.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStudentsDialog} color="primary">
              Fermer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Boîte de dialogue d'ajout de classe */}
        <Dialog
          open={addClassDialogOpen}
          onClose={handleCloseAddClassDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Ajouter une nouvelle classe</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nom de la classe"
                margin="normal"
                variant="outlined"
                required
              />
              <TextField
                fullWidth
                select
                label="Niveau"
                margin="normal"
                variant="outlined"
                SelectProps={{ native: true }}
                required
              >
                <option value="">Sélectionnez un niveau</option>
                <option value="Seconde">Seconde</option>
                <option value="Première">Première</option>
                <option value="Terminale">Terminale</option>
              </TextField>
              <TextField
                fullWidth
                label="Section"
                margin="normal"
                variant="outlined"
                required
              />
              <TextField
                fullWidth
                label="Salle"
                margin="normal"
                variant="outlined"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddClassDialog}>
              Annuler
            </Button>
            <Button 
              onClick={handleSaveClass} 
              variant="contained" 
              color="primary"
            >
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Classes;