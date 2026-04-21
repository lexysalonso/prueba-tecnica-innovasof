import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'https://pruebareactjs.test-class.com/Api/';

const ClienteContext = createContext();

const initialState = {
  clientes: [],
  clienteActual: null,
  loading: false,
  error: null,
  usuario: null,
  isAuthenticated: false,
  token: null,
  userid: null,
  authInitialized: false,
};

const clienteReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'GET_CLIENTES':
      return { ...state, clientes: action.payload, loading: false };
    case 'ADD_CLIENTE':
      return { ...state, clientes: [...state.clientes, action.payload] };
    case 'UPDATE_CLIENTE':
      return {
        ...state,
        clientes: state.clientes.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_CLIENTE':
      return {
        ...state,
        clientes: state.clientes.filter((c) => c.id !== action.payload),
      };
    case 'SET_CLIENTE_ACTUAL':
      return { ...state, clienteActual: action.payload };
    case 'SET_USUARIO':
      return { 
        ...state, 
        usuario: action.payload.usuario, 
        isAuthenticated: action.payload.isAuthenticated,
        token: action.payload.token,
        userid: action.payload.userid
      };
    case 'SET_AUTH_INITIALIZED':
      return { ...state, authInitialized: true };
    case 'LOGOUT':
      return { ...state, usuario: null, isAuthenticated: false, token: null, userid: null };
    default:
      return state;
  }
};

export const ClienteProvider = ({ children }) => {
  const [state, dispatch] = useReducer(clienteReducer, initialState);

  const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const getClientes = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    let totalClientes = 0;
    try {
      const usuarioId = state.userid || localStorage.getItem('userid') || '';
      const response = await api.post('api/Cliente/Listado', { identificacion: '', nombre: '', usuarioId });
      totalClientes = response.data?.length || 0;
      localStorage.setItem('totalClientes', totalClientes.toString());
    } catch (error) {
      totalClientes = parseInt(localStorage.getItem('totalClientes') || '0', 10);
    }
    localStorage.setItem('totalClientes', totalClientes.toString());
    dispatch({ type: 'GET_CLIENTES', payload: [] });
  };

  const searchClientes = useCallback(async (identificacion = '', nombre = '') => {
    if (!state.userid) {
      const errorMsg = 'Hubo un inconveniente con la transacción.';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      throw new Error(errorMsg);
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const identificacionValue = String(identificacion || '').trim();
      const nombreValue = String(nombre || '').trim();
      const usuarioIdValue = state.userid || localStorage.getItem('userid') || '';

      const requestBody = {
        identificacion: identificacionValue,
        nombre: nombreValue,
        usuarioId: usuarioIdValue,
        // Compatibilidad con backends que aún esperan este casing.
        UsuarioId: usuarioIdValue,
      };
      const response = await api.post('api/Cliente/Listado', requestBody);
      let data = Array.isArray(response.data) ? response.data : [];

      const normalize = (value) =>
        String(value || '')
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

      const normalizedIdentificacion = normalize(identificacionValue);
      const normalizedNombre = normalize(nombreValue);

      const applyLocalFilters = (rows) =>
        rows.filter((cliente) => {
        const clienteIdentificacion = normalize(cliente?.identificacion);
        const clienteNombreCompleto = normalize(`${cliente?.nombre || ''} ${cliente?.apellidos || ''}`);
        const tokensNombre = normalizedNombre.split(/\s+/).filter(Boolean);
        const matchIdentificacion = !normalizedIdentificacion
          || clienteIdentificacion.includes(normalizedIdentificacion);
        const matchNombre = tokensNombre.length === 0
          || tokensNombre.every((token) => clienteNombreCompleto.includes(token));
        return matchIdentificacion && matchNombre;
      });

      let filteredData = applyLocalFilters(data);

      // Fallback: algunos backends no filtran bien nombre completo.
      if (nombreValue && filteredData.length === 0) {
        const fallbackResponse = await api.post('api/Cliente/Listado', {
          identificacion: identificacionValue,
          nombre: '',
          usuarioId: usuarioIdValue,
          UsuarioId: usuarioIdValue,
        });
        data = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : [];
        filteredData = applyLocalFilters(data);
      }

      dispatch({ type: 'GET_CLIENTES', payload: filteredData });
    } catch (error) {
      const errorMsg = 'Hubo un inconveniente con la transacción.';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, [state.userid]);

  const getClienteById = async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.get(`Clientes/${id}`);
      dispatch({ type: 'SET_CLIENTE_ACTUAL', payload: response.data });
      return response.data;
    } catch (error) {
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const cliente = clientes.find((c) => c.id === id);
      dispatch({ type: 'SET_CLIENTE_ACTUAL', payload: cliente });
      return cliente;
    }
  };

  const addCliente = async (cliente) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    let nuevoTotal = 0;
    try {
      const response = await api.post('Clientes', cliente);
      dispatch({ type: 'ADD_CLIENTE', payload: response.data });
      nuevoTotal = parseInt(localStorage.getItem('totalClientes') || '0', 10) + 1;
      localStorage.setItem('totalClientes', nuevoTotal.toString());
      return response.data;
    } catch (error) {
      nuevoTotal = parseInt(localStorage.getItem('totalClientes') || '0', 10) + 1;
      localStorage.setItem('totalClientes', nuevoTotal.toString());
      dispatch({ type: 'ADD_CLIENTE', payload: null });
      return null;
    }
  };

  const updateCliente = async (cliente) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.put(`Clientes/${cliente.id}`, cliente);
      dispatch({ type: 'UPDATE_CLIENTE', payload: response.data });
      return response.data;
    } catch (error) {
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const index = clientes.findIndex((c) => c.id === cliente.id);
      if (index !== -1) {
        clientes[index] = cliente;
        localStorage.setItem('clientes', JSON.stringify(clientes));
        dispatch({ type: 'UPDATE_CLIENTE', payload: cliente });
      }
      return cliente;
    }
  };

  const deleteCliente = async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    let nuevoTotal = 0;
    try {
      await api.delete(`api/Cliente/Eliminar/${id}`);
      dispatch({ type: 'DELETE_CLIENTE', payload: id });
      nuevoTotal = parseInt(localStorage.getItem('totalClientes') || '0', 10) - 1;
      localStorage.setItem('totalClientes', nuevoTotal.toString());
    } catch (error) {
      const errorMsg = 'Hubo un inconveniente con la transacción.';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const login = async (username, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.post('api/Authenticate/login', { username, password });
      const { token, userid, username: userName } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userid', userid);
      localStorage.setItem('username', userName);
      dispatch({ type: 'SET_USUARIO', payload: { usuario: { userid, username: userName }, isAuthenticated: true, token, userid } });
      return { success: true };
    } catch (error) {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const storedUsername = localStorage.getItem('username') || '';
        const userid = localStorage.getItem('userid');
        dispatch({
          type: 'SET_USUARIO',
          payload: {
            usuario: { userid, username: storedUsername },
            isAuthenticated: true,
            token: storedToken,
            userid,
          },
        });
        return { success: true };
      }
      dispatch({ type: 'SET_ERROR', payload: 'Credenciales inválidas' });
      return { success: false, error: 'Credenciales inválidas' };
    }
  };

  const registro = async (username, email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.post('api/Authenticate/register', { username, email, password });
      if (response.data?.status === 'Success') {
        const loginRes = await api.post('api/Authenticate/login', { username, password });
        const { token, userid, username: userName } = loginRes.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userid', userid);
        localStorage.setItem('username', userName);
        dispatch({ type: 'SET_USUARIO', payload: { usuario: { username: userName }, isAuthenticated: true, token, userid } });
        return { success: true, data: response.data };
      }
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error en el registro';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userid');
    localStorage.removeItem('username');
    localStorage.removeItem('totalClientes');
    dispatch({ type: 'LOGOUT' });
  };

  const setClienteActual = (cliente) => {
    dispatch({ type: 'SET_CLIENTE_ACTUAL', payload: cliente });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userid = localStorage.getItem('userid');
    const username = localStorage.getItem('username');
    if (token && userid && username) {
      dispatch({ type: 'SET_USUARIO', payload: { usuario: { userid, username }, isAuthenticated: true, token, userid } });
    }
    dispatch({ type: 'SET_AUTH_INITIALIZED' });
  }, []);

  return (
    <ClienteContext.Provider
      value={{
        clientes: state.clientes,
        clienteActual: state.clienteActual,
        loading: state.loading,
        error: state.error,
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated,
        authInitialized: state.authInitialized,
        userid: state.userid,
        token: state.token,
        getClientes,
        searchClientes,
        getClienteById,
        addCliente,
        updateCliente,
        deleteCliente,
        setClienteActual,
        login,
        registro,
        logout,
      }}
    >
      {children}
    </ClienteContext.Provider>
  );
};

export const useCliente = () => {
  const context = useContext(ClienteContext);
  if (!context) {
    throw new Error('useCliente must be used within a ClienteProvider');
  }
  return context;
};