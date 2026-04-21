import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useCliente } from '../context/ClienteContext';
import { useThemeContext } from '../context/ThemeContext';

const Home = () => {
  const { usuario, isAuthenticated, authInitialized, clientes, getClientes } = useCliente();
  const { mode } = useThemeContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authInitialized) return;
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    getClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authInitialized, isAuthenticated, navigate]);

  const menuItems = [
    {
      titulo: 'Consulta Clientes',
      descripcion: 'Ver y buscar clientes',
      icono: <SearchIcon sx={{ fontSize: 40 }} />,
      ruta: '/consulta',
      color: '#1a237e',
    },
    {
      titulo: 'Nuevo Cliente',
      descripcion: 'Agregar cliente',
      icono: <PersonAddIcon sx={{ fontSize: 40 }} />,
      ruta: '/mantenimiento',
      color: '#534bae',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: mode === 'dark' ? 'white' : '#1a237e' }}>
            Bienvenido
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', bgcolor: '#1a237e', color: 'white' }}>
            <DashboardIcon sx={{ fontSize: 50, mr: 2 }} />
            <Box>
              <Typography variant="h3">{localStorage.getItem('totalClientes') || 0}</Typography>
              <Typography variant="body2">Total Clientes</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: mode === 'dark' ? 'white' : '#1a237e' }}>
        Menú Principal
      </Typography>

      <Grid container spacing={3}>
        {menuItems.map((item, index) => (
          <Grid xs={12} sm={6} key={index}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
              }}
              onClick={() => navigate(item.ruta)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: item.color, color: 'white', mr: 3 }}>
                  {item.icono}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: mode === 'dark' ? 'white' : 'inherit' }}>
                    {item.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.descripcion}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;