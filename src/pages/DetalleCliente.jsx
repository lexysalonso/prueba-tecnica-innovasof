import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useCliente } from '../context/ClienteContext';

const DetalleCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getClienteById, clienteActual, isAuthenticated, authInitialized } = useCliente();
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    if (!authInitialized) return;
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [authInitialized, isAuthenticated, navigate]);

  useEffect(() => {
    if (location.state) {
      setCliente(location.state);
    } else if (id) {
      getClienteById(id).then(setCliente);
    }
  }, [id, location.state, getClienteById]);

  if (!cliente) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Cargando...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/consulta')}
        sx={{ mb: 2 }}
      >
        Volver
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
            Detalle del Cliente
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/mantenimiento/${cliente.id}`, { state: cliente })}
            sx={{ bgcolor: '#1a237e' }}
          >
            Editar
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Nombre</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {cliente.nombre} {cliente.apellidos}
            </Typography>
          </Grid>

          <Grid xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Identificación</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {cliente.identificacion}
            </Typography>
          </Grid>

          <Grid xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Email</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {cliente.email}
            </Typography>
          </Grid>

          <Grid xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Teléfono Celular</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {cliente.telefonoCelular}
            </Typography>
          </Grid>

          <Grid xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Teléfono Otros</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {cliente.telefonoOtros || 'N/A'}
            </Typography>
          </Grid>

          <Grid xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Dirección</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {cliente.direccion}
            </Typography>
          </Grid>

          <Grid xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Fecha de Nacimiento</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {cliente.fechaNacimiento ? new Date(cliente.fechaNacimiento).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>

          <Grid xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Fecha de Afiliación</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {cliente.fechaAfiliacion ? new Date(cliente.fechaAfiliacion).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>

          <Grid xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Sexo</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {cliente.sexo}
            </Typography>
          </Grid>

          <Grid xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={cliente.estado} 
                color={cliente.estado === 'Activo' ? 'success' : cliente.estado === 'Inactivo' ? 'error' : 'warning'}
              />
            </Box>
          </Grid>

          <Grid xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Empresa</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {cliente.empresa || 'N/A'}
            </Typography>
          </Grid>

          <Grid xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Intereses</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {cliente.intereses?.map((interes, index) => (
                <Chip key={index} label={interes} />
              )) || 'N/A'}
            </Box>
          </Grid>

          <Grid xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Reseña Personal</Typography>
            <Typography variant="body1">
              {cliente.resenaPersonal || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default DetalleCliente;