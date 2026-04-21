import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useCliente } from '../context/ClienteContext';
import { useThemeContext } from '../context/ThemeContext';
import axios from 'axios';

const initialForm = {
  nombre: '',
  apellidos: '',
  identificacion: '',
  telefonoCelular: '',
  otroTelefono: '',
  direccion: '',
  fNacimiento: '',
  fAfiliacion: '',
  sexo: '',
  resenaPersonal: '',
  imagen: '',
  interesFK: '',
};

const API_URL = 'https://pruebareactjs.test-class.com/Api/';

const MantenimientoClientes = () => {
  const { isAuthenticated, authInitialized, userid } = useCliente();
  const { mode } = useThemeContext();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [intereses, setIntereses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = params.id || location.state?.id;

  const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  useEffect(() => {
    if (!authInitialized) return;
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [authInitialized, isAuthenticated, navigate]);

  // Load intereses and cliente data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load intereses
        const interesesResponse = await api.get('api/Intereses/Listado');
        setIntereses(interesesResponse.data);

        // Load cliente if editing
        if (params.id) {
          const clienteResponse = await api.get(`api/Cliente/Obtener/${params.id}`);
          const cliente = clienteResponse.data;
          setFormData({
            ...cliente,
            fNacimiento: cliente.fNacimiento ? cliente.fNacimiento.split('T')[0] : '',
            fAfiliacion: cliente.fAfiliacion ? cliente.fAfiliacion.split('T')[0] : '',
            interesFK: cliente.interesFK || cliente.interesesId || '',
          });
        } else if (location.state?.id) {
          const clienteResponse = await api.get(`api/Cliente/Obtener/${location.state.id}`);
          const cliente = clienteResponse.data;
          setFormData({
            ...cliente,
            fNacimiento: cliente.fNacimiento ? cliente.fNacimiento.split('T')[0] : '',
            fAfiliacion: cliente.fAfiliacion ? cliente.fAfiliacion.split('T')[0] : '',
            interesFK: cliente.interesFK || cliente.interesesId || '',
          });
          navigate(`/mantenimiento/${location.state.id}`, { replace: true });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setSnackbarMessage('Error al cargar los datos');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, location.state, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim() || formData.nombre.length > 50) {
      newErrors.nombre = formData.nombre.length > 50 ? 'Máximo 50 caracteres' : 'Requerido';
    }

    if (!formData.apellidos.trim() || formData.apellidos.length > 100) {
      newErrors.apellidos = formData.apellidos.length > 100 ? 'Máximo 100 caracteres' : 'Requerido';
    }

    if (!formData.identificacion.trim() || formData.identificacion.length > 20) {
      newErrors.identificacion = formData.identificacion.length > 20 ? 'Máximo 20 caracteres' : 'Requerido';
    }

    if (!formData.telefonoCelular.trim() || formData.telefonoCelular.length > 20) {
      newErrors.telefonoCelular = formData.telefonoCelular.length > 20 ? 'Máximo 20 caracteres' : 'Requerido';
    }

    if (formData.otroTelefono && formData.otroTelefono.length > 20) {
      newErrors.otroTelefono = 'Máximo 20 caracteres';
    }

    if (!formData.direccion.trim() || formData.direccion.length > 200) {
      newErrors.direccion = formData.direccion.length > 200 ? 'Máximo 200 caracteres' : 'Requerido';
    }

    if (!formData.fNacimiento) {
      newErrors.fNacimiento = 'Requerido';
    }

    if (!formData.fAfiliacion) {
      newErrors.fAfiliacion = 'Requerido';
    }

    if (formData.fNacimiento && formData.fAfiliacion) {
      const fechaNacimiento = new Date(formData.fNacimiento);
      const fechaAfiliacion = new Date(formData.fAfiliacion);
      if (fechaNacimiento >= fechaAfiliacion) {
        newErrors.fNacimiento = 'Debe ser menor que la fecha de afiliación';
        newErrors.fAfiliacion = 'Debe ser mayor que la fecha de nacimiento';
      }
    }

    if (!formData.sexo) {
      newErrors.sexo = 'Requerido';
    }

    if (formData.resenaPersonal && formData.resenaPersonal.length > 200) {
      newErrors.resenaPersonal = 'Máximo 200 caracteres';
    }

    if (!formData.interesFK) {
      newErrors.interesFK = 'Requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imagen: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const formatDateTime = (dateValue) => {
        if (!dateValue) return '';
        if (dateValue.includes('T')) return dateValue;
        return new Date(`${dateValue}T00:00:00`).toISOString();
      };

      const payload = {
        id: formData.id || '',
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        identificacion: formData.identificacion,
        celular: formData.telefonoCelular,
        otroTelefono: formData.otroTelefono || '',
        direccion: formData.direccion,
        fNacimiento: formatDateTime(formData.fNacimiento),
        fAfiliacion: formatDateTime(formData.fAfiliacion),
        sexo: formData.sexo,
        resennaPersonal: formData.resenaPersonal || '',
        imagen: formData.imagen || '',
        interesFK: formData.interesFK,
        usuarioId: userid || localStorage.getItem('userid') || '',
      };

      if (isEditing) {
        await api.post('api/Cliente/Actualizar', payload);
        setSnackbarMessage('Cliente actualizado exitosamente');
      } else {
        await api.post('api/Cliente/Crear', payload);
        setSnackbarMessage('Cliente creado exitosamente');
      }
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate('/consulta');
      }, 1500);
    } catch (error) {
      setSnackbarMessage('Hubo un inconveniente con la transacción.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box>
              <input
                id="imagen-cliente-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="imagen-cliente-input">
                <Avatar
                  src={formData.imagen || ''}
                  sx={{ width: 56, height: 56, cursor: 'pointer', bgcolor: '#1a237e' }}
                >
                  {formData.nombre?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </label>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: mode === 'dark' ? 'white' : 'primary.main' }}>
              {isEditing ? 'Editar Cliente' : 'Mantenimiento de Clientes'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/consulta')}
              sx={{ bgcolor: '#1a237e' }}
            >
              Regresar
            </Button>
            <Button
              type="submit"
              form="mantenimiento-cliente-form"
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{ bgcolor: '#1a237e' }}
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </Box>
        </Box>

        <form id="mantenimiento-cliente-form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Primera Fila: Identificación | Nombre | Apellidos */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Identificación *"
                name="identificacion"
                value={formData.identificacion}
                onChange={handleChange}
                error={!!errors.identificacion}
                helperText={errors.identificacion}
                slotProps={{ input: { maxLength: 20 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Nombre *"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
                slotProps={{ input: { maxLength: 50 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Apellidos *"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                error={!!errors.apellidos}
                helperText={errors.apellidos}
                slotProps={{ input: { maxLength: 100 } }}
              />
            </Grid>

            {/* Segunda Fila: Género | Fecha de Nacimiento | Fecha de Afiliación */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label="Género *"
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                error={!!errors.sexo}
                helperText={errors.sexo}
              >
                <MenuItem value="M">Masculino</MenuItem>
                <MenuItem value="F">Femenino</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Fecha de Nacimiento *"
                name="fNacimiento"
                type="date"
                value={formData.fNacimiento}
                onChange={handleChange}
                error={!!errors.fNacimiento}
                helperText={errors.fNacimiento}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{
                  '& input[type="date"]::-webkit-datetime-edit': {
                    color: formData.fNacimiento ? 'inherit' : 'transparent',
                  },
                  '& input[type="date"]:focus::-webkit-datetime-edit': {
                    color: 'inherit',
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Fecha de Afiliación *"
                name="fAfiliacion"
                type="date"
                value={formData.fAfiliacion}
                onChange={handleChange}
                error={!!errors.fAfiliacion}
                helperText={errors.fAfiliacion}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{
                  '& input[type="date"]::-webkit-datetime-edit': {
                    color: formData.fAfiliacion ? 'inherit' : 'transparent',
                  },
                  '& input[type="date"]:focus::-webkit-datetime-edit': {
                    color: 'inherit',
                  },
                }}
              />
            </Grid>

            {/* Tercera Fila: Teléfono Celular | Teléfono Otro | Intereses */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Teléfono Celular *"
                name="telefonoCelular"
                value={formData.telefonoCelular}
                onChange={handleChange}
                error={!!errors.telefonoCelular}
                helperText={errors.telefonoCelular}
                slotProps={{ input: { maxLength: 20 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Teléfono Otro"
                name="otroTelefono"
                value={formData.otroTelefono}
                onChange={handleChange}
                error={!!errors.otroTelefono}
                helperText={errors.otroTelefono}
                slotProps={{ input: { maxLength: 20 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label="Intereses *"
                name="interesFK"
                value={formData.interesFK}
                onChange={handleChange}
                error={!!errors.interesFK}
                helperText={errors.interesFK}
              >
                <MenuItem value="">Seleccione un interés</MenuItem>
                {intereses.map((interes) => (
                  <MenuItem key={interes.id} value={interes.id}>
                    {interes.descripcion}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Dirección - Full Width */}
            <Grid size={12}>
              <TextField
                fullWidth
                label="Dirección *"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                error={!!errors.direccion}
                helperText={errors.direccion}
                slotProps={{ input: { maxLength: 200 } }}
              />
            </Grid>

            {/* Reseña Personal - Full Width */}
            <Grid size={12}>
              <TextField
                fullWidth
                label="Reseña Personal"
                name="resenaPersonal"
                value={formData.resenaPersonal}
                onChange={handleChange}
                error={!!errors.resenaPersonal}
                helperText={errors.resenaPersonal}
                multiline
                rows={4}
                slotProps={{ input: { maxLength: 200 } }}
              />
            </Grid>

          </Grid>
        </form>
      </Paper>

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

export default MantenimientoClientes;