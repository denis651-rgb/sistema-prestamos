import React, { useState, useEffect } from 'react';
import { X, Edit3, User, Shield, CreditCard, CheckCircle2, MapPin, AlertTriangle, Lock } from 'lucide-react';
import { editarPrestamo } from '../api/prestamosApi';
import { Moneda, TipoSistema, Prestamo } from '../types';

interface EditarPrestamoModalProps {
  prestamo: Prestamo | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (prestamo: Prestamo) => void;
}

export const EditarPrestamoModal: React.FC<EditarPrestamoModalProps> = ({
  prestamo,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [clienteDni, setClienteDni] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteDireccion, setClienteDireccion] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');

  const [garanteNombre, setGaranteNombre] = useState('');
  const [garanteDni, setGaranteDni] = useState('');

  const [moneda, setMoneda] = useState<Moneda>('BOB');
  const [monto, setMonto] = useState<number>(5000);
  const [tasaMensualPct, setTasaMensualPct] = useState<number>(3.0);
  const [plazoMeses, setPlazoMeses] = useState<number>(12);
  const [tipoSistema, setTipoSistema] = useState<TipoSistema>('FRANCES');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [ciudad, setCiudad] = useState<string>('Cochabamba');
  const [pais, setPais] = useState<string>('Bolivia');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tienePagos = prestamo?.cuotas?.some((c) => c.estado === 'PAGADA') || false;

  useEffect(() => {
    if (prestamo) {
      setClienteDni(prestamo.cliente.dni || '');
      setClienteNombre(prestamo.cliente.nombreCompleto || '');
      setClienteTelefono(prestamo.cliente.telefono || '');
      setClienteDireccion(prestamo.cliente.direccion || '');
      setClienteEmail(prestamo.cliente.email || '');

      setGaranteNombre(prestamo.garanteNombre || '');
      setGaranteDni(prestamo.garanteDni || '');

      setMoneda(prestamo.moneda || 'BOB');
      setMonto(prestamo.montoSolicitado || 0);
      setTasaMensualPct(prestamo.tasaInteresMensual || 0);
      setPlazoMeses(prestamo.plazoMeses || 1);
      setTipoSistema(prestamo.tipoSistema || 'FRANCES');
      setFechaInicio(prestamo.fechaInicio || '');

      setCiudad(prestamo.ciudad || (prestamo.moneda === 'EUR' ? 'Barcelona' : 'Cochabamba'));
      setPais(prestamo.pais || (prestamo.moneda === 'EUR' ? 'España' : 'Bolivia'));
      setError(null);
    }
  }, [prestamo]);

  if (!isOpen || !prestamo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tienePagos) {
      setError('Este contrato no se puede editar porque ya cuenta con pagos registrados.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await editarPrestamo(prestamo.id, {
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
      setError(err.message || 'Error al actualizar el contrato/préstamo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${
              tienePagos ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            }`}>
              {tienePagos ? <Lock className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Editar Préstamo y Contrato</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                  {prestamo.codigo}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {tienePagos
                  ? '🔒 Bloqueado: Este préstamo ya tiene cuotas pagadas y no admite cambios'
                  : 'Modifica condiciones antes de registrar el primer pago'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de Bloqueo si tiene pagos */}
        {tienePagos && (
          <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-3 text-amber-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-300">Contrato Legal Protegido contra Modificaciones</p>
              <p className="mt-1 leading-relaxed">
                Este préstamo ya registra pagos efectivos en el sistema contable. Para preservar la integridad fiscal,
                auditoría y validez jurídica del contrato firmado, los términos ya no pueden ser alterados.
              </p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <fieldset disabled={tienePagos} className="space-y-6 disabled:opacity-60">
            {/* Sección 1: Datos del Prestatario */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                <User className="w-4 h-4 text-indigo-400" />
                1. Datos del Cliente / Prestatario
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">DNI / CI *</label>
                  <input
                    type="text"
                    value={clienteDni}
                    onChange={(e) => setClienteDni(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Dirección Domiciliaria</label>
                  <input
                    type="text"
                    value={clienteDireccion}
                    onChange={(e) => setClienteDireccion(e.target.value)}
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">DNI / CI del Garante</label>
                  <input
                    type="text"
                    value={garanteDni}
                    onChange={(e) => setGaranteDni(e.target.value)}
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
                Al guardar, se recalculará automáticamente la tabla de amortización y se regenerará el contrato en PDF en el Escritorio.
              </p>
            </div>
          </fieldset>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cerrar
            </button>
            {!tienePagos && (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {loading ? 'Actualizando Contrato...' : 'Guardar Cambios y Actualizar Contrato'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
