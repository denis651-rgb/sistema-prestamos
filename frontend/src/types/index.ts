export type Moneda = 'BOB' | 'EUR';
export type TipoSistema = 'FRANCES' | 'ALEMAN';
export type EstadoPrestamo = 'ACTIVO' | 'CANCELADO';
export type EstadoCuota = 'PENDIENTE' | 'PAGADA';

export interface Cliente {
  id?: number;
  dni: string;
  nombreCompleto: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  fechaRegistro?: string;
  cantidadPrestamos?: number;
}

export interface Cuota {
  id: number;
  nroCuota: number;
  fechaVencimiento: string;
  cuotaTotal: number;
  interes: number;
  capitalAmortizado: number;
  saldoRestante: number;
  estado: EstadoCuota;
}

export interface Prestamo {
  id: number;
  codigo: string;
  cliente: Cliente;
  garanteNombre?: string;
  garanteDni?: string;
  moneda: Moneda;
  montoSolicitado: number;
  tasaInteresMensual: number;
  plazoMeses: number;
  tipoSistema: TipoSistema;
  fechaInicio: string;
  ciudad?: string;
  pais?: string;
  saldoActual: number;
  estado: EstadoPrestamo;
  cuotas?: Cuota[];
}

export interface CuotaCalculada {
  nroCuota: number;
  fechaVencimiento: string;
  cuotaTotal: number;
  interes: number;
  amortizacion: number;
  saldoRestante: number;
}

export interface PrestamoPayload {
  clienteDni: string;
  clienteNombre: string;
  clienteTelefono?: string;
  clienteDireccion?: string;
  clienteEmail?: string;
  garanteNombre?: string;
  garanteDni?: string;
  moneda: Moneda;
  monto: number;
  tasaMensualPct: number;
  plazoMeses: number;
  tipoSistema: TipoSistema;
  fechaInicio: string;
  ciudad?: string;
  pais?: string;
}

export interface PagoRequest {
  monto?: number;
  metodoPago: string;
  notas?: string;
}

export interface PagoResponse {
  id: number;
  nroRecibo: string;
  prestamoId: number;
  prestamoCodigo: string;
  cuotaId: number;
  nroCuota: number;
  clienteNombre: string;
  clienteDni: string;
  moneda: string;
  montoPagado: number;
  capitalAmortizado: number;
  interesPagado: number;
  saldoRestantePrestamo: number;
  fechaPago: string;
  metodoPago: string;
  estadoPrestamo: string;
  notas?: string;
}

export interface ResumenDashboard {
  totalColocadoBOB: number;
  saldoPendienteBOB: number;
  cobradoHoyBOB: number;
  totalColocadoEUR: number;
  saldoPendienteEUR: number;
  cobradoHoyEUR: number;
  prestamosActivos: number;
  prestamosCancelados: number;
  totalClientes: number;
  cuotasPendientesHoy: number;
  cuotasVencidas: number;
}

export interface ConfiguracionEmpresa {
  id?: number;
  tipoComprobante: string;
  subtituloComprobante?: string;
  nombreEmisor: string;
  documentoIdentidad?: string;
  etiquetaDocumento?: string;
  actividad?: string;
  direccion?: string;
  telefono?: string;
  ciudadPais?: string;
  pieComprobante?: string;
  mostrarQr?: boolean;
  mostrarCreditoFiscal?: boolean;
}
