import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  IconButton,
  Box,
  Alert,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Pagination,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../context/ThemeContext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useCliente } from '../context/ClienteContext';

const ConsultaClientes = () => {
  const { clientes, deleteCliente, searchClientes, isAuthenticated, authInitialized, loading } = useCliente();
  const { mode } = useThemeContext();
  const navigate = useNavigate();
  const [identificacion, setIdentificacion] = useState('');
  const [nombre, setNombre] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!authInitialized) return;
    if (!isAuthenticated) {
      navigate('/');
    } else {
      searchClientes().catch(() => {
        setSnackbarMessage('Hubo un inconveniente con la transacción.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
    }
    // searchClientes changes reference due to context state updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authInitialized, isAuthenticated, navigate]);

  const handleSearch = async () => {
    if (!loading) {
      try {
        await searchClientes(identificacion, nombre);
      } catch (error) {
        setSnackbarMessage('Hubo un inconveniente con la transacción.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
      setCurrentPage(1); // Reset to first page on new search
    }
  };

  const handleSearchOnEnter = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  const handleDeleteClick = (cliente) => {
    setClienteToDelete(cliente);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (clienteToDelete) {
      try {
        await deleteCliente(clienteToDelete.id);
        setSnackbarMessage('Cliente eliminado exitosamente');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        setOpenDeleteDialog(false);
        setClienteToDelete(null);
        // Refresh the list
        await searchClientes(identificacion, nombre);
        setCurrentPage(1); // Reset to first page after delete
      } catch (error) {
        setSnackbarMessage('Hubo un inconveniente con la transacción.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setClienteToDelete(null);
  };

  const handleEditar = (cliente) => {
    navigate(`/mantenimiento/${cliente.id}`, { state: cliente });
  };

  // Pagination calculations
  const totalPages = Math.ceil(clientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedClientes = clientes.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, bgcolor: 'inherit' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 3, gap: { xs: 2, md: 0 } }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: mode === 'dark' ? 'white' : '#1a237e' }}>
          Consulta de Clientes
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/home')}
            sx={{ bgcolor: '#1a237e' }}
          >
            Regresar
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/mantenimiento')}
            sx={{ bgcolor: '#1a237e' }}
          >
            Agregar
          </Button>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Buscar Clientes</Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Identificación"
            value={identificacion}
            onChange={(e) => setIdentificacion(e.target.value)}
            onKeyDown={handleSearchOnEnter}
            sx={{ flex: 1 }}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={handleSearchOnEnter}
            sx={{ flex: 1 }}
          />
          <Tooltip title="Buscar">
            <span>
              <IconButton
                color="primary"
                onClick={handleSearch}
                disabled={loading}
                sx={{ bgcolor: '#1a237e', color: 'white', borderRadius: '50%', width: 56, height: 56 }}
              >
                <SearchIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ bgcolor: '#1a237e' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Identificación</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : displayedClientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="body1" color="text.secondary">
                    No se encontraron clientes
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayedClientes.map((cliente) => (
                <TableRow key={cliente.id} hover>
                  <TableCell>{cliente.identificacion}</TableCell>
                  <TableCell>{cliente.nombre} {cliente.apellidos}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditar(cliente)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(cliente)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: 'text.primary' }}>
            ¿Está seguro de que desea eliminar al cliente{' '}
            <Typography component="span" sx={{ fontWeight: 'bold' }}>
              {clienteToDelete?.nombre} {clienteToDelete?.apellidos}
            </Typography>
            ?
            <br />
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleDeleteCancel} sx={{ bgcolor: '#9e9e9e' }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setOpenSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConsultaClientes;