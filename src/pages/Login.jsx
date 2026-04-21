import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useCliente } from '../context/ClienteContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useCliente();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('El usuario es requerido');
      return;
    }

    if (!password.trim()) {
      setError('La contraseña es requerida');
      return;
    }

    if (rememberMe) {
      localStorage.setItem('rememberedUsername', username);
    } else {
      localStorage.removeItem('rememberedUsername');
    }

    const result = await login(username, password);
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error || 'Credenciales inválidas');
    }
  };

  const handleRememberMeChange = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    if (checked && username) {
      localStorage.setItem('rememberedUsername', username);
    } else {
      localStorage.removeItem('rememberedUsername');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={6} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ bgcolor: '#1a237e', p: 1.5, borderRadius: '50%', mb: 2 }}>
            <LockOutlinedIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 3 }}>
            Iniciar Sesión
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Usuario *"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              autoFocus
            />
            <TextField
              fullWidth
              label="Contraseña *"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  sx={{ '&.Mui-checked': { color: '#1a237e' } }}
                />
              }
              label="Recuérdame"
              sx={{ my: 1, width: '100%', justifyContent: 'flex-start' }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 1, mb: 2, bgcolor: '#1a237e' }}
            >
              INICIAR SESIÓN
            </Button>
          </form>

          <Typography variant="body2">
            ¿No tiene una cuenta?{' '}
            <Link component="button" onClick={() => navigate('/registro')}>
              Regístrese
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;