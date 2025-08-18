import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Block as BlockIcon
} from '@mui/icons-material';

// Données factices pour l'exemple
const createUserData = (id, name, email, role, status, avatar, joinDate) => {
  return { id, name, email, role, status, avatar, joinDate };
};

const initialUsers = [
  createUserData(1, 'Jean Dupont', 'jean.dupont@example.com', 'Admin', 'Actif', '', '2023-01-15'),
  createUserData(2, 'Marie Martin', 'marie.martin@example.com', 'Enseignant', 'Actif', '', '2023-02-20'),
  createUserData(3, 'Pierre Durand', 'pierre.durand@example.com', 'Étudiant', 'Inactif', '', '2023-03-10'),
  createUserData(4, 'Sophie Petit', 'sophie.petit@example.com', 'Étudiant', 'Actif', '', '2023-03-15'),
  createUserData(5, 'Lucas Moreau', 'lucas.moreau@example.com', 'Enseignant', 'En attente', '', '2023-04-05'),
  createUserData(6, 'Emma Bernard', 'emma.bernard@example.com', 'Étudiant', 'Actif', '', '2023-04-10'),
  createUserData(7, 'Hugo Laurent', 'hugo.laurent@example.com', 'Étudiant', 'Bloqué', '', '2023-04-15'),
  createUserData(8, 'Léa Petit', 'lea.petit@example.com', 'Enseignant', 'Actif', '', '2023-05-01'),
];

const statusColors = {
  'Actif': 'success',
  'Inactif': 'default',
  'En attente': 'warning',
  'Bloqué': 'error'
};

const roleColors = {
  'Admin': 'primary',
  'Enseignant': 'secondary',
  'Étudiant': 'info'
};

const Users = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [users, setUsers] = useState(initialUsers);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Étudiant',
    status: 'Actif'
  });

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    // Ici, vous ajouteriez la logique pour supprimer l'utilisateur
    console.log('Suppression de l\'utilisateur :', userToDelete);
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleAddUserClick = () => {
    setAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    setNewUser({
      name: '',
      email: '',
      role: 'Étudiant',
      status: 'Actif'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = () => {
    // Créer un nouvel utilisateur avec un ID unique
    const newUserToAdd = {
      ...newUser,
      id: Math.max(...users.map(u => u.id), 0) + 1, // Générer un nouvel ID
      avatar: `/avatars/default.jpg`, // Avatar par défaut
      joinDate: new Date().toISOString().split('T')[0] // Date d'aujourd'hui
    };

    // Mettre à jour la liste des utilisateurs
    setUsers([...users, newUserToAdd]);
    
    // Réinitialiser le formulaire
    handleAddDialogClose();
    
    // Revenir à la première page pour voir le nouvel utilisateur
    setPage(0);
  };

  const filteredUsers = users.filter((user) =>
    Object.values(user).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedUsers = filteredUsers.sort((a, b) => {
    let comparison = 0;
    if (a[orderBy] > b[orderBy]) {
      comparison = 1;
    } else if (a[orderBy] < b[orderBy]) {
      comparison = -1;
    }
    return order === 'desc' ? -comparison : comparison;
  });

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - sortedUsers.length) : 0;

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
        {/* En-tête avec titre et bouton d'ajout */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          flexDirection={{ xs: 'column', sm: 'row' }}
          gap={2}
          mb={4}
          sx={{
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Gestion des utilisateurs
            </Typography>
            <Typography color="textSecondary" variant="subtitle1">
              Gérez les comptes des utilisateurs de la plateforme
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddUserClick}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              px: 3,
              py: 1,
              alignSelf: 'center'
            }}
          >
            Ajouter un utilisateur
          </Button>
        </Box>

        {/* Carte de recherche et filtre */}
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
            flex: 1,
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
            <TextField
              variant="outlined"
              placeholder="Rechercher un utilisateur..."
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                style: { 
                  minWidth: isMobile ? '100%' : 300,
                  backgroundColor: theme.palette.background.paper
                }
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                ml: 'auto',
                [theme.breakpoints.down('sm')]: {
                  width: '100%',
                  ml: 0
                }
              }}
            >
              Filtres
            </Button>
          </Box>
        </Paper>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    Nom
                  </TableSortLabel>
                </TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date d'inscription</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow hover key={user.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          src={user.avatar} 
                          alt={user.name}
                          sx={{ width: 40, height: 40, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {user.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={roleColors[user.role] || 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={statusColors[user.status] || 'default'}
                        size="small"
                        icon={user.status === 'Actif' ? 
                          <CheckCircleIcon fontSize="small" /> : 
                          user.status === 'Bloqué' ? 
                          <BlockIcon fontSize="small" /> : 
                          <CancelIcon fontSize="small" />
                        }
                        sx={{
                          '& .MuiChip-icon': {
                            color: 'inherit',
                            ml: 0.5
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.joinDate).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Plus d'options">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, user)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 73 * emptyRows }}>
                  <TableCell colSpan={5} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page :"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
          }
          sx={{
            '& .MuiTablePagination-toolbar': {
              flexWrap: 'wrap',
              justifyContent: 'center',
              '& > *': {
                my: 1
              }
            }
          }}
        />
      </Box>

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
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Voir le profil</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedUser)}>
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
        disableScrollLock={true}
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle id="alert-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete?.name}</strong> ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel} 
            color="primary"
            autoFocus
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Boîte de dialogue d'ajout d'utilisateur */}
      <Dialog 
        open={addDialogOpen} 
        onClose={handleAddDialogClose} 
        maxWidth="sm" 
        fullWidth
        disableScrollLock={true}
        disableEnforceFocus
        disableAutoFocus
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 2,
            m: 2
          }
        }}
      >
        <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Nom complet"
              type="text"
              fullWidth
              variant="outlined"
              value={newUser.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              name="email"
              label="Adresse email"
              type="email"
              fullWidth
              variant="outlined"
              value={newUser.email}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="role-label">Rôle</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={newUser.role}
                label="Rôle"
                onChange={handleInputChange}
              >
                <MenuItem value="Admin">Administrateur</MenuItem>
                <MenuItem value="Enseignant">Enseignant</MenuItem>
                <MenuItem value="Étudiant">Étudiant</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel id="status-label">Statut</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={newUser.status}
                label="Statut"
                onChange={handleInputChange}
              >
                <MenuItem value="Actif">Actif</MenuItem>
                <MenuItem value="Inactif">Inactif</MenuItem>
                <MenuItem value="En attente">En attente</MenuItem>
                <MenuItem value="Bloqué">Bloqué</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleAddDialogClose} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleAddUser} 
            variant="contained" 
            color="primary"
            disabled={!newUser.name || !newUser.email}
            sx={{ borderRadius: 2 }}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;