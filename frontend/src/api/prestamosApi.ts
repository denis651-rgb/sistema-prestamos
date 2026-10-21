import axios from 'axios';
import {
  Cliente,
  CuotaCalculada,
  PagoRequest,
  PagoResponse,
  Prestamo,
  PrestamoPayload,
  ResumenDashboard,
  ConfiguracionEmpresa
} from '../types';

// Detectar automáticamente si se navega en localhost o 127.0.0.1
const currentHost = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';

const api = axios.create({
  baseURL: `http://${currentHost}:8080/api/v1`,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Interceptor de respuesta para manejo uniforme de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Error en el servidor backend';
    return Promise.reject(new Error(message));
  }
);

// Endpoints Préstamos
export const simularCronograma = (payload: {
  monto: number;
  tasaMensualPct: number;
  plazoMeses: number;
  tipoSistema: 'FRANCES' | 'ALEMAN';
  moneda?: string;
  fechaInicio?: string;
}) => api.post<CuotaCalculada[]>('/prestamos/simular', payload);

export const crearPrestamo = (payload: PrestamoPayload) =>
  api.post<Prestamo>('/prestamos', payload);

export const editarPrestamo = (id: number, payload: PrestamoPayload) =>
  api.put<Prestamo>(`/prestamos/${id}`, payload);

export const listarPrestamos = () =>
  api.get<Prestamo[]>('/prestamos');

export const obtenerPrestamoPorId = (id: number) =>
  api.get<Prestamo>(`/prestamos/${id}`);

// Endpoints Cuotas & Pagos
export const registrarPagoCuota = (cuotaId: number, payload: PagoRequest) =>
  api.post<PagoResponse>(`/cuotas/${cuotaId}/pagos`, payload);

// Endpoints Clientes
export const listarClientes = () =>
  api.get<Cliente[]>('/clientes');

export const buscarClientePorDni = (dni: string) =>
  api.get<Cliente>(`/clientes/buscar?dni=${dni}`);

export const guardarCliente = (cliente: Cliente) =>
  api.post<Cliente>('/clientes', cliente);

// Dashboard
export const obtenerResumenDashboard = () =>
  api.get<ResumenDashboard>('/dashboard/resumen');

// Health Check directo a la API con CORS garantizado
export const checkHealth = () =>
  api.get<ResumenDashboard>('/dashboard/resumen');

export default api;

// Expedientes Digitales en Escritorio
export const abrirCarpetaExpediente = async (dni: string) => {
  return api.post<{ success: boolean; ruta?: string; dni: string }>(`/expedientes/abrir?dni=${encodeURIComponent(dni)}`);
};

export const abrirCarpetaRaizExpedientes = async () => {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.openPath) {
    try {
      await (window as any).electronAPI.openPath();
    } catch (e) {
      console.warn('Electron openPath fallback:', e);
    }
  }
  return api.post<{ success: boolean; ruta: string }>('/expedientes/abrir-raiz');
};

export const sincronizarExpedientes = () =>
  api.post('/expedientes/sincronizar');

// Endpoints Configuración del Emisor y Factura / Recibo
export const obtenerConfiguracion = () =>
  api.get<ConfiguracionEmpresa>('/configuracion');

export const guardarConfiguracion = (payload: ConfiguracionEmpresa) =>
  api.put<ConfiguracionEmpresa>('/configuracion', payload);
