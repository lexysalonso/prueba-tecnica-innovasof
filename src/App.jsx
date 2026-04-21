import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Error404 from './pages/Error404';
import Home from './pages/Home';
import ConsultaClientes from './pages/ConsultaClientes';
import MantenimientoClientes from './pages/MantenimientoClientes';
import DetalleCliente from './pages/DetalleCliente';
import Navbar from './components/Navbar';
import { ClienteProvider, useCliente } from './context/ClienteContext';
import { ThemeProvider as ThemeContextProvider } from './context/ThemeContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authInitialized } = useCliente();
  if (!authInitialized) return null;
  return isAuthenticated ? children : <Navigate to="/" />;
};

const AppLayout = ({ children }) => {
  return <Navbar>{children}</Navbar>;
};

function App() {
  return (
    <ThemeContextProvider>
      <ClienteProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/home" element={<ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>} />
            <Route path="/consulta" element={<ProtectedRoute><AppLayout><ConsultaClientes /></AppLayout></ProtectedRoute>} />
            <Route path="/mantenimiento/:id?" element={<ProtectedRoute><AppLayout><MantenimientoClientes /></AppLayout></ProtectedRoute>} />
            <Route path="/detalle/:id" element={<ProtectedRoute><AppLayout><DetalleCliente /></AppLayout></ProtectedRoute>} />
            <Route path="/404" element={<AppLayout><Error404 /></AppLayout>} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </BrowserRouter>
      </ClienteProvider>
    </ThemeContextProvider>
  );
}

export default App;