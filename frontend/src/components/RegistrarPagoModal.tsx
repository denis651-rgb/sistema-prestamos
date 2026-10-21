import React, { useState } from 'react';
import { X, DollarSign, CheckCircle2, } from 'lucide-react';
import { registrarPagoCuota } from '../api/prestamosApi';
import { Cuota, Prestamo, PagoResponse } from '../types';

interface RegistrarPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  cuota: Cuota | null;
  prestamo: Prestamo | null;
  onPagoCompletado: (pagoResp: PagoResponse) => void;
}

export const RegistrarPagoModal: React.FC<RegistrarPagoModalProps> = ({
  isOpen,
  onClose,
  cuota,
  prestamo,
  onPagoCompletado
}) => {
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !cuota || !prestamo) return null;

  const simbolo = prestamo.moneda === 'BOB' ? 'Bs.' : '€';

  const handlePagar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await registrarPagoCuota(cuota.id, {
        monto: cuota.cuotaTotal,
        metodoPago,
        notas: notas.trim() || undefined
      });
      onPagoCompletado(res.data);
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cobro de Cuota #{cuota.nroCuota}</h3>
              <p className="text-xs text-slate-400">Préstamo {prestamo.codigo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handlePagar} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Desglose de la cuota */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Cliente:</span>
              <span className="font-semibold text-slate-200">{prestamo.cliente.nombreCompleto}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Amortización a Capital:</span>
              <span className="text-emerald-400 font-mono">
                {simbolo} {cuota.capitalAmortizado.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Interés del Periodo:</span>
              <span className="text-amber-300 font-mono">
                {simbolo} {cuota.interes.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
              <span className="text-xs font-bold text-white">Total a Cobrar:</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {simbolo} {cuota.cuotaTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Método de Pago</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="EFECTIVO">Efectivo en Caja</option>
              <option value="TRANSFERENCIA">Transferencia Bancaria</option>
              <option value="QR">Pago QR / Simple</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notas / Observaciones (Opcional)</label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. Depósito comprobante #102938"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Procesando...' : 'Confirmar Cobro y Emitir Recibo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
