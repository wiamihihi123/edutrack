import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Book as BookIcon,
  Category as CategoryIcon,
  AccessTime as AccessTimeIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Subject as SubjectIcon,
  School as SchoolIcon,
  Sort as SortIcon
} from '@mui/icons-material';

// Données factices pour l'exemple
const subjectsData = [
  {
    id: 1,
    name: 'Mathématiques',
    code: 'MATH-101',
    category: 'Scientifique',
    level: 'Terminale',
    credits: 4,
    hoursPerWeek: 6,
    teacher: 'Marie Martin',
    description: 'Algèbre, géométrie, analyse et probabilités',
    status: 'active',
    chapters: [
      {
        title: 'Algèbre linéaire',
        lessons: [
          { title: 'Introduction aux vecteurs', duration: '2h' },
          { title: 'Opérations sur les matrices', duration: '3h' },
          { title: 'Systèmes d\'équations linéaires', duration: '4h' }
        ]
      },
      {
        title: 'Analyse',
        lessons: [
          { title: 'Fonctions et limites', duration: '3h' },
          { title: 'Dérivées et applications', duration: '4h' },
          { title: 'Intégrales', duration: '3h' }
        ]
      }
    ],
    learningObjectives: [
      'Maîtriser les concepts fondamentaux de l\'algèbre linéaire',
      'Comprendre et appliquer le calcul différentiel et intégral',
      'Résoudre des problèmes mathématiques complexes'
    ]
  },
  {
    id: 2,
    name: 'Français',
    code: 'FR-101',
    category: 'Littéraire',
    level: 'Première',
    credits: 3,
    hoursPerWeek: 4,
    teacher: 'Pierre Durand',
    description: 'Littérature française et analyse de textes',
    status: 'active',
    chapters: [
      {
        title: 'Le roman',
        lessons: [
          { title: 'Le personnage de roman', duration: '2h' },
          { title: 'Les procédés narratifs', duration: '2h' }
        ]
      }
    ],
    learningObjectives: [
      'Analyser des œuvres littéraires',
      'Développer une argumentation claire et structurée'
    ]
  },
  {
    id: 3,
    name: 'Physique-Chimie',
    code: 'PC-101',
    category: 'Scientifique',
    level: 'Terminale',
    credits: 4,
    hoursPerWeek: 5,
    teacher: 'Sophie Petit',
    description: 'Mécanique, électricité, chimie organique',
    status: 'active',
    chapters: [
      {
        title: 'Mécanique',
        lessons: [
          { title: 'Introduction à la mécanique', duration: '2h' },
          { title: 'Mouvement et forces', duration: '3h' },
          { title: 'Énergie et travail', duration: '4h' }
        ]
      },
      {
        title: 'Électricité',
        lessons: [
          { title: 'Introduction à l\'électricité', duration: '3h' },
          { title: 'Circuits électriques', duration: '4h' },
          { title: 'Magnétisme', duration: '3h' }
        ]
      }
    ],
    learningObjectives: [
      'Comprendre les principes fondamentaux de la mécanique',
      'Analyser des circuits électriques',
      'Résoudre des problèmes de physique'
    ]
  },
  {
    id: 4,
    name: 'Histoire-Géographie',
    code: 'HG-101',
    category: 'Générale',
    level: 'Seconde',
    credits: 2,
    hoursPerWeek: 3,
    teacher: 'Lucas Moreau',
    description: 'Histoire contemporaine et géographie mondiale',
    status: 'inactive',
    chapters: [
      {
        title: 'Histoire contemporaine',
        lessons: [
          { title: 'Introduction à l\'histoire contemporaine', duration: '2h' },
          { title: 'La Première Guerre mondiale', duration: '3h' },
          { title: 'La Seconde Guerre mondiale', duration: '4h' }
        ]
      },
      {
        title: 'Géographie mondiale',
        lessons: [
          { title: 'Introduction à la géographie mondiale', duration: '3h' },
          { title: 'Les continents', duration: '4h' },
          { title: 'Les océans', duration: '3h' }
        ]
      }
    ],
    learningObjectives: [
      'Comprendre les événements historiques',
      'Analyser des cartes géographiques',
      'Résoudre des problèmes géographiques'
    ]
  },
  {
    id: 5,
    name: 'Sciences Économiques et Sociales',
    code: 'SES-101',
    category: 'Économique',
    level: 'Première',
    credits: 3,
    hoursPerWeek: 4,
    teacher: 'Julie Bernard',
    description: 'Économie, sociologie et sciences politiques',
    status: 'active',
    chapters: [
      {
        title: 'Économie',
        lessons: [
          { title: 'Introduction à l\'économie', duration: '2h' },
          { title: 'Les marchés', duration: '3h' },
          { title: 'La monnaie et la banque', duration: '4h' }
        ]
      },
      {
        title: 'Sociologie',
        lessons: [
          { title: 'Introduction à la sociologie', duration: '3h' },
          { title: 'Les groupes sociaux', duration: '4h' },
          { title: 'La culture', duration: '3h' }
        ]
      }
    ],
    learningObjectives: [
      'Comprendre les principes économiques',
      'Analyser des phénomènes sociaux',
      'Résoudre des problèmes économiques et sociaux'
    ]
  },
];

const Subjects = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [view, setView] = useState('grid');
  const [addSubjectDialogOpen, setAddSubjectDialogOpen] = useState(false);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    status: 'active'
  });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleMenuOpen = (event, subject) => {
    setAnchorEl(event.currentTarget);
    setSelectedSubject(subject);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSubject(null);
  };

  const handleDeleteClick = (subject) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    // Ici, vous ajouteriez la logique pour supprimer la matière
    console.log('Suppression de la matière :', subjectToDelete);
    setDeleteDialogOpen(false);
    setSubjectToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSubjectToDelete(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (filter, value) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error';
  };

  const getStatusLabel = (status) => {
    return status === 'active' ? 'Active' : 'Inactive';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Scientifique': 'primary',
      'Littéraire': 'secondary',
      'Économique': 'info',
      'Générale': 'default',
    };
    return colors[category] || 'default';
  };

  const handleAddSubjectClick = () => {
    setAddSubjectDialogOpen(true);
  };

  const handleCloseAddSubjectDialog = () => {
    setAddSubjectDialogOpen(false);
  };

  const handleSaveSubject = () => {
    // Logique pour sauvegarder la nouvelle matière
    console.log('Nouvelle matière à sauvegarder');
    setAddSubjectDialogOpen(false);
  };

  const handleViewProgram = () => {
    setProgramDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseProgramDialog = () => {
    setProgramDialogOpen(false);
  };

  // Filtrer et trier les matières
  const filteredAndSortedSubjects = subjectsData
    .filter(subject => {
      // Filtre par recherche
      const matchesSearch = Object.values(subject).some(
        value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Filtres par catégorie, niveau et statut
      const matchesFilters = 
        (!filters.category || subject.category === filters.category) &&
        (!filters.level || subject.level === filters.level) &&
        (!filters.status || subject.status === filters.status);
      
      return matchesSearch && matchesFilters;
    })
    .sort((a, b) => {
      // Tri
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Récupérer les valeurs uniques pour les filtres
  const categories = [...new Set(subjectsData.map(subject => subject.category))];
  const levels = [...new Set(subjectsData.map(subject => subject.level))];

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
              Gestion des matières
            </Typography>
            <Typography color="textSecondary" variant="subtitle1">
              Gérez les matières et les programmes d'enseignement
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
              onClick={handleAddSubjectClick}
              sx={{ borderRadius: 2, textTransform: 'none', ml: 1 }}
            >
              Nouvelle matière
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
              placeholder="Rechercher une matière..."
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
            
            <TextField
              select
              size="small"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              variant="outlined"
              placeholder="Catégorie"
              sx={{ 
                minWidth: 150,
                '& .MuiSelect-select': { py: 1 }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CategoryIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">Toutes les catégories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              size="small"
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              variant="outlined"
              placeholder="Niveau"
              sx={{ 
                minWidth: 130,
                '& .MuiSelect-select': { py: 1 }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SchoolIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">Tous les niveaux</MenuItem>
              {levels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </TextField>
            
            <FormControlLabel
              control={
                <Switch
                  checked={filters.status === 'active'}
                  onChange={(e) => handleFilterChange('status', e.target.checked ? 'active' : 'inactive')}
                  color="primary"
                />
              }
              label={filters.status === 'active' ? 'Actives' : 'Inactives'}
              sx={{ ml: 'auto' }}
            />
          </Box>

          {view === 'grid' ? (
            <Grid container spacing={3}>
              {filteredAndSortedSubjects.map((subject) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={subject.id}>
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
                          label={getStatusLabel(subject.status)}
                          color={getStatusColor(subject.status)}
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
                            handleMenuOpen(e, subject);
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
                          {subject.name.charAt(0)}
                        </Avatar>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {subject.name}
                        </Typography>
                        <Chip
                          label={subject.category}
                          color={getCategoryColor(subject.category)}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="textSecondary">
                          {subject.code} • {subject.level}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box>
                        <Box display="flex" alignItems="center" mb={1}>
                          <SchoolIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="textSecondary" noWrap>
                            {subject.teacher}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mb={1}>
                          <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="textSecondary">
                            {subject.hoursPerWeek}h/semaine • {subject.credits} crédits
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          color="textSecondary" 
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            height: '2.8em',
                            lineHeight: '1.4em'
                          }}
                        >
                          {subject.description}
                        </Typography>
                      </Box>
                    </CardActionArea>
                    
                    <Box p={2} pt={0}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<BookIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        Voir le programme
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
                  <Grid item xs={12} sm={3}>
                    <Box display="flex" alignItems="center">
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={600}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSort('name')}
                      >
                        Matière
                        <SortIcon 
                          fontSize="small" 
                          sx={{ 
                            ml: 0.5,
                            opacity: sortConfig.key === 'name' ? 1 : 0.3,
                            transform: sortConfig.key === 'name' && sortConfig.direction === 'desc' ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s'
                          }} 
                        />
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight={600}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleSort('category')}
                    >
                      Catégorie
                      <SortIcon 
                        fontSize="small" 
                        sx={{ 
                          ml: 0.5,
                          opacity: sortConfig.key === 'category' ? 1 : 0.3,
                          transform: sortConfig.key === 'category' && sortConfig.direction === 'desc' ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s'
                        }} 
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight={600}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleSort('level')}
                    >
                      Niveau
                      <SortIcon 
                        fontSize="small" 
                        sx={{ 
                          ml: 0.5,
                          opacity: sortConfig.key === 'level' ? 1 : 0.3,
                          transform: sortConfig.key === 'level' && sortConfig.direction === 'desc' ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s'
                        }} 
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight={600}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleSort('teacher')}
                    >
                      Enseignant
                      <SortIcon 
                        fontSize="small" 
                        sx={{ 
                          ml: 0.5,
                          opacity: sortConfig.key === 'teacher' ? 1 : 0.3,
                          transform: sortConfig.key === 'teacher' && sortConfig.direction === 'desc' ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s'
                        }} 
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight={600}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleSort('status')}
                    >
                      Statut
                      <SortIcon 
                        fontSize="small" 
                        sx={{ 
                          ml: 0.5,
                          opacity: sortConfig.key === 'status' ? 1 : 0.3,
                          transform: sortConfig.key === 'status' && sortConfig.direction === 'desc' ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s'
                        }} 
                      />
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <List disablePadding>
                {filteredAndSortedSubjects.map((subject) => (
                  <React.Fragment key={subject.id}>
                    <Box 
                      p={2}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
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
                              {subject.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {subject.name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {subject.code}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={4} sm={2}>
                          <Chip
                            label={subject.category}
                            color={getCategoryColor(subject.category)}
                            size="small"
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={4} sm={2}>
                          <Typography variant="body2">
                            {subject.level}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} sm={2}>
                          <Typography variant="body2" noWrap>
                            {subject.teacher}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} sm={2}>
                          <Chip
                            label={getStatusLabel(subject.status)}
                            color={getStatusColor(subject.status)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={4} sm={1} textAlign="right">
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleMenuOpen(e, subject)}
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
          <MenuItem onClick={handleViewProgram}>
            <ListItemIcon>
              <BookIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Voir le programme</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Modifier</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => selectedSubject && handleDeleteClick(selectedSubject)}>
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
              Êtes-vous sûr de vouloir supprimer la matière <strong>{subjectToDelete?.name}</strong> ?
              Cette action est irréversible et affectera tous les cours associés.
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

        {/* Boîte de dialogue d'ajout de matière */}
        <Dialog
          open={addSubjectDialogOpen}
          onClose={handleCloseAddSubjectDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Ajouter une nouvelle matière</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nom de la matière"
                margin="normal"
                variant="outlined"
                required
              />
              <TextField
                fullWidth
                label="Code"
                margin="normal"
                variant="outlined"
                required
              />
              <TextField
                fullWidth
                select
                label="Catégorie"
                margin="normal"
                variant="outlined"
                SelectProps={{ native: true }}
                required
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </TextField>
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
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Heures par semaine"
                type="number"
                margin="normal"
                variant="outlined"
                required
              />
              <TextField
                fullWidth
                label="Enseignant"
                margin="normal"
                variant="outlined"
                required
              />
              <TextField
                fullWidth
                label="Description"
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddSubjectDialog}>
              Annuler
            </Button>
            <Button 
              onClick={handleSaveSubject} 
              variant="contained" 
              color="primary"
            >
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Boîte de dialogue du programme */}
        <Dialog
          open={programDialogOpen}
          onClose={handleCloseProgramDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Programme de {selectedSubject?.name}
          </DialogTitle>
          <DialogContent>
            {selectedSubject ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Détails du programme
                </Typography>
                <Typography paragraph>
                  {selectedSubject.description || "Aucune description disponible."}
                </Typography>
                
                <Box mt={3}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Chapitres et leçons
                  </Typography>
                  <List>
                    {selectedSubject.chapters?.length > 0 ? (
                      selectedSubject.chapters.map((chapter, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={`Chapitre ${index + 1}: ${chapter.title}`}
                              secondary={`${chapter.lessons?.length || 0} leçons`}
                            />
                          </ListItem>
                          {chapter.lessons?.map((lesson, lessonIndex) => (
                            <ListItem key={`${index}-${lessonIndex}`} sx={{ pl: 4 }}>
                              <ListItemText
                                primary={`Leçon ${lessonIndex + 1}: ${lesson.title}`}
                                secondary={`Durée: ${lesson.duration}`}
                              />
                            </ListItem>
                          ))}
                        </React.Fragment>
                      ))
                    ) : (
                      <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        Aucun chapitre n'a été ajouté à ce programme.
                      </Typography>
                    )}
                  </List>
                </Box>
                
                <Box mt={3}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Objectifs d'apprentissage
                  </Typography>
                  {selectedSubject.learningObjectives?.length > 0 ? (
                    <List dense>
                      {selectedSubject.learningObjectives.map((objective, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={objective} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="textSecondary" sx={{ fontStyle: 'italic' }}>
                      Aucun objectif d'apprentissage défini.
                    </Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <Typography>Aucune matière sélectionnée.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseProgramDialog} color="primary">
              Fermer
            </Button>
          </DialogActions>
        </Dialog>

        {/* ... autres dialogues existants ... */}
      </Box>
    </Container>
  );
};

export default Subjects;