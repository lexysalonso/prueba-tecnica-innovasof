import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, useMediaQuery, Avatar, Divider, Tooltip } from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from '@mui/icons-material/Person';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useCliente } from '../context/ClienteContext';
import { useThemeContext } from '../context/ThemeContext';
import { useState } from 'react';

const Navbar = ({ children }) => {
  const { usuario, logout, isAuthenticated } = useCliente();
  const { mode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const displayUsername = usuario?.username || localStorage.getItem('username') || 'Usuario';

  if (!isAuthenticated || location.pathname === '/' || location.pathname === '/registro') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { titulo: 'IN', subtexto: 'INICIO', ruta: '/home' },
    { titulo: 'CC', subtexto: 'Consulta de clientes', ruta: '/consulta' },
  ];

  const handleNavigate = (ruta) => {
    navigate(ruta);
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/home" 
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            COMPANIA PRUEBA
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              {displayUsername}
            </Typography>
            <Tooltip title={mode === 'light' ? 'Modo Oscuro' : 'Modo Claro'}>
              <Box
                onClick={toggleTheme}
                sx={{
                  bgcolor: mode === 'light' ? '#e0e0e0' : '#424242',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: mode === 'light' ? '#bdbdbd' : '#616161' },
                }}
              >
                {mode === 'light' ? <DarkModeIcon sx={{ color: '#616161', fontSize: 20 }} /> : <LightModeIcon sx={{ color: '#ffeb3b', fontSize: 20 }} />}
              </Box>
            </Tooltip>
            <Tooltip title="Cerrar Sesión">
              <Box
                onClick={handleLogout}
                sx={{
                  bgcolor: mode === 'light' ? '#e0e0e0' : '#424242',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: mode === 'light' ? '#bdbdbd' : '#616161' },
                }}
              >
                <ExitToAppIcon sx={{ color: mode === 'light' ? '#616161' : '#e0e0e0', fontSize: 20 }} />
              </Box>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer 
          anchor="left" 
          open={drawerOpen} 
          onClose={() => setDrawerOpen(false)}
          slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}
        >
        <Box sx={{ width: 260, pt: 2, minWidth: 260, bgcolor: 'background.paper', height: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
              <PersonIcon sx={{ fontSize: 35 }} />
            </Avatar>
            <Typography variant="body1" sx={{ mt: 1, fontWeight: 'medium' }}>
              {displayUsername}
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ py: 1.5, px: 2, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              MENU
            </Typography>
          </Box>
          <Divider />
<List>
              {menuItems.map((item) => (
                <ListItemButton
                  key={item.titulo} 
                  onClick={() => handleNavigate(item.ruta)}
                  selected={location.pathname === item.ruta}
                  sx={{ 
                    cursor: 'pointer',
                    height: 'auto',
                    py: 1.5,
                    '&.Mui-selected': { bgcolor: mode === 'light' ? '#e8eaf6' : '#3f51b5' }
                  }}
                >
                  <Box sx={{ width: 28, textAlign: 'center', mr: 1, color: mode === 'light' ? '#90caf9' : '#90caf9', flexShrink: 0 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {item.titulo}
                    </Typography>
                  </Box>
                  <ListItemText 
                    primary={item.subtexto}
                  />
</ListItemButton>
              ))}
            </List>
        </Box>
      </Drawer>

      {!isMobile && (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
          <Box sx={{ width: 260, bgcolor: 'background.paper', p: 2, minWidth: 260 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
                <PersonIcon sx={{ fontSize: 35 }} />
              </Avatar>
              <Typography variant="body1" sx={{ mt: 1, fontWeight: 'medium' }}>
                {displayUsername}
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ py: 1.5, px: 2, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                MENU
              </Typography>
            </Box>
            <Divider />
            <List disablePadding>
              {menuItems.map((item) => (
                <ListItemButton
                  key={item.titulo} 
                  onClick={() => navigate(item.ruta)}
                  selected={location.pathname === item.ruta}
                  sx={{ 
                    borderRadius: 0,
                    cursor: 'pointer',
                    height: 'auto',
                    py: 1.5,
                    '&.Mui-selected': { bgcolor: mode === 'light' ? '#e8eaf6' : '#3f51b5' }
                  }}
                >
                  <Box sx={{ width: 28, textAlign: 'center', mr: 1, color: mode === 'light' ? '#90caf9' : '#90caf9', flexShrink: 0 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {item.titulo}
                    </Typography>
                  </Box>
                  <ListItemText 
                    primary={item.subtexto}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
          <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
            {children}
          </Box>
        </Box>
      )}

      {isMobile && (
        <Box sx={{ p: 2, bgcolor: 'background.default', minHeight: '100vh' }}>
          {children}
        </Box>
      )}
    </>
  );
};

export default Navbar;