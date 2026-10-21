import { getFechaHoyLocal } from '../utils/dateUtils';
import React, { useState } from 'react';
import { X, PlusCircle, User, Shield, CreditCard, CheckCircle2, MapPin } from 'lucide-react';
import { crearPrestamo, buscarClientePorDni } from '../api/prestamosApi';
import { Moneda, TipoSistema, Prestamo } from '../types';

interface NuevoPrestamoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (prestamo: Prestamo) => void;
  initialValues?: {
    monto?: number;
    tasaMensualPct?: number;
    plazoMeses?: number;
    tipoSistema?: TipoSistema;
    moneda?: Moneda;
  };
}

export const NuevoPrestamoModal: React.FC<NuevoPrestamoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialValues
}) => {
  const [clienteDni, setClienteDni] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteDireccion, setClienteDireccion] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');

  const [garanteNombre, setGaranteNombre] = useState('');
  const [garanteDni, setGaranteDni] = useState('');

  const [moneda, setMoneda] = useState<Moneda>(initialValues?.moneda || 'BOB');
  const [monto, setMonto] = useState<number>(initialValues?.monto || 10000);
  const [tasaMensualPct, setTasaMensualPct] = useState<number>(initialValues?.tasaMensualPct || 2.5);
  const [plazoMeses, setPlazoMeses] = useState<number>(initialValues?.plazoMeses || 12);
  const [tipoSistema, setTipoSistema] = useState<TipoSistema>(initialValues?.tipoSistema || 'FRANCES');
  const [fechaInicio, setFechaInicio] = useState<string>(getFechaHoyLocal());
  const [ciudad, setCiudad] = useState<string>(initialValues?.moneda === 'EUR' ? 'Barcelona' : 'Cochabamba');
  const [pais, setPais] = useState<string>(initialValues?.moneda === 'EUR' ? 'España' : 'Bolivia');

  const [loading, setLoading] = useState(false);
  const [buscandoDni, setBuscandoDni] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBuscarCliente = async () => {
    if (!clienteDni.trim()) return;
    setBuscandoDni(true);
    try {
      const res = await buscarClientePorDni(clienteDni.trim());
      if (res.data) {
        setClienteNombre(res.data.nombreCompleto);
        if (res.data.telefono) setClienteTelefono(res.data.telefono);
        if (res.data.direccion) setClienteDireccion(res.data.direccion);
        if (res.data.email) setClienteEmail(res.data.email);
      }
    } catch {
      // Cliente nuevo, continuar normal
    } finally {
      setBuscandoDni(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await crearPrestamo({
        clienteDni: clienteDni.trim(),
        clienteNombre: clienteNombre.trim(),
        clienteTelefono: clienteTelefono.trim() || undefined,
        clienteDireccion: clienteDireccion.trim() || undefined,
        clienteEmail: clienteEmail.trim() || undefined,
        garanteNombre: garanteNombre.trim() || undefined,
        garanteDni: garanteDni.trim() || undefined,
        moneda,
        monto,
        tasaMensualPct,
        plazoMeses,
        tipoSistema,
        fechaInicio,
        ciudad: ciudad.trim() || undefined,
        pais: pais.trim() || undefined
      });
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al emitir préstamo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Otorgar Nuevo Crédito</h3>
              <p className="text-xs text-slate-400">Registro legal, generación de tabla de amortización y pagaré</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Sección 1: Datos del Titular */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              <User className="w-4 h-4 text-indigo-400" />
              1. Datos del Prestatario (Titular)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">DNI / CI *</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={clienteDni}
                    onChange={(e) => setClienteDni(e.target.value)}
                    onBlur={handleBuscarCliente}
                    placeholder="Ej. 4892145"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleBuscarCliente}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 rounded-lg"
                    title="Buscar cliente registrado"
                  >
                    {buscandoDni ? '...' : 'Buscar'}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Nombres y Apellidos"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Teléfono / Celular</label>
                <input
                  type="text"
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  placeholder="+591 7..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Dirección Domiciliaria</label>
                <input
                  type="text"
                  value={clienteDireccion}
                  onChange={(e) => setClienteDireccion(e.target.value)}
                  placeholder="Calle, Número, Zona o Ciudad"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Garante Solidario */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              <Shield className="w-4 h-4 text-emerald-400" />
              2. Garante Solidario / Fiador (Opcional)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nombre del Garante</label>
                <input
                  type="text"
                  value={garanteNombre}
                  onChange={(e) => setGaranteNombre(e.target.value)}
                  placeholder="Nombres y Apellidos del fiador"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">DNI / CI del Garante</label>
                <input
                  type="text"
                  value={garanteDni}
                  onChange={(e) => setGaranteDni(e.target.value)}
                  placeholder="Cédula de Identidad"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Sección 3: Condiciones Financieras */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              <CreditCard className="w-4 h-4 text-amber-400" />
              3. Condiciones Económicas del Préstamo
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Moneda *</label>
                <select
                  value={moneda}
                  onChange={(e) => {
                    const nueva = e.target.value as Moneda;
                    setMoneda(nueva);
                    if (nueva === 'EUR') {
                      if (ciudad === 'Cochabamba' || !ciudad) setCiudad('Barcelona');
                      if (pais === 'Bolivia' || !pais) setPais('España');
                    } else {
                      if (ciudad === 'Barcelona' || !ciudad) setCiudad('Cochabamba');
                      if (pais === 'España' || !pais) setPais('Bolivia');
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="BOB">BOB (Bolivianos - Bs.)</option>
                  <option value="EUR">EUR (Euros - €)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Capital Solicitado *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={monto}
                  onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Tasa Interés Mensual (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tasaMensualPct}
                  onChange={(e) => setTasaMensualPct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Plazo (Meses) *</label>
                <input
                  type="number"
                  min="1"
                  max="360"
                  value={plazoMeses}
                  onChange={(e) => setPlazoMeses(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Sistema de Amortización *</label>
                <select
                  value={tipoSistema}
                  onChange={(e) => setTipoSistema(e.target.value as TipoSistema)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="FRANCES">Francés (Cuota Nivelada Fija)</option>
                  <option value="ALEMAN">Alemán (Amortización Constante)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Fecha Primer Desembolso *</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

                    {/* Sección 4: Ubicación Legal del Contrato */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              <MapPin className="w-4 h-4 text-rose-400" />
              4. Lugar de Celebración del Contrato (Ciudad y País)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Ciudad donde se firma el contrato *</label>
                <input
                  type="text"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  placeholder="Ej: Barcelona, Cochabamba, Madrid, Santa Cruz..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">País *</label>
                <input
                  type="text"
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  placeholder="Ej: España, Bolivia, etc."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Esta ciudad y país figurarán automáticamente en el encabezado, cláusulas legales y jurisdicción de los tribunales del contrato.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Generando Contrato...' : 'Aprobar y Generar Crédito'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
