import { getFechaHoyLocal } from '../utils/dateUtils';
import React, { useState } from 'react';
import { X, Calculator, Table, Check } from 'lucide-react';
import { simularCronograma } from '../api/prestamosApi';
import { CuotaCalculada, Moneda, TipoSistema } from '../types';

interface SimuladorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferirAPrestamo?: (datos: {
    monto: number;
    tasaMensualPct: number;
    plazoMeses: number;
    tipoSistema: TipoSistema;
    moneda: Moneda;
  }) => void;
}

export const SimuladorModal: React.FC<SimuladorModalProps> = ({
  isOpen,
  onClose,
  onTransferirAPrestamo
}) => {
  const [monto, setMonto] = useState<number>(10000);
  const [tasaMensualPct, setTasaMensualPct] = useState<number>(2.5);
  const [plazoMeses, setPlazoMeses] = useState<number>(12);
  const [tipoSistema, setTipoSistema] = useState<TipoSistema>('FRANCES');
  const [moneda, setMoneda] = useState<Moneda>('BOB');
  const [cronograma, setCronograma] = useState<CuotaCalculada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimular = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await simularCronograma({
        monto,
        tasaMensualPct,
        plazoMeses,
        tipoSistema,
        moneda,
        fechaInicio: getFechaHoyLocal()
      });
      setCronograma(res.data);
    } catch (err: any) {
      setError(err.message || 'Error al calcular cronograma');
    } finally {
      setLoading(false);
    }
  };

  const totalIntereses = cronograma.reduce((acc, c) => acc + c.interes, 0);
  const totalPagar = cronograma.reduce((acc, c) => acc + c.cuotaTotal, 0);
  const simbolo = moneda === 'BOB' ? 'Bs.' : '€';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Simulador Financiero de Créditos</h3>
              <p className="text-xs text-slate-400">Algoritmo exacto BigDecimal: Sistema Francés (Cuota Fija) y Alemán (Amortización Constante)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Parámetros de Simulación */}
          <form onSubmit={handleSimular} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Moneda</label>
              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value as Moneda)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="BOB">BOB (Bolivianos - Bs.)</option>
                <option value="EUR">EUR (Euros - €)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Monto Solicitado</label>
              <input
                type="number"
                step="0.01"
                min="100"
                value={monto}
                onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tasa Mensual (%)</label>
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Plazo (Meses)</label>
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Sistema</label>
              <select
                value={tipoSistema}
                onChange={(e) => setTipoSistema(e.target.value as TipoSistema)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="FRANCES">Francés (Cuota Fija)</option>
                <option value="ALEMAN">Alemán (Amortiz. Fija)</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-5 flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                {loading ? 'Calculando...' : 'Calcular Cronograma'}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Tarjetas de Resumen del Cálculo */}
          {cronograma.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl">
                <p className="text-xs text-slate-400">Total a Desembolsar</p>
                <p className="text-xl font-bold text-white mt-1">
                  {simbolo} {monto.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl">
                <p className="text-xs text-slate-400">Total Intereses Generados</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">
                  {simbolo} {totalIntereses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl">
                <p className="text-xs text-slate-400">Monto Total a Devolver</p>
                <p className="text-xl font-bold text-indigo-300 mt-1">
                  {simbolo} {totalPagar.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          {/* Tabla de Cronograma */}
          {cronograma.length > 0 && (
            <div className="border border-slate-700 rounded-xl overflow-hidden">
              <div className="bg-slate-800/80 px-4 py-2.5 border-b border-slate-700 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
                  <Table className="w-4 h-4 text-indigo-400" />
                  Tabla de Amortización Proyectada
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  {cronograma.length} cuotas mensuales
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Cuota #</th>
                      <th className="py-2.5 px-3">Vencimiento</th>
                      <th className="py-2.5 px-3 text-right">Cuota Total</th>
                      <th className="py-2.5 px-3 text-right">Capital</th>
                      <th className="py-2.5 px-3 text-right">Interés</th>
                      <th className="py-2.5 px-3 text-right">Saldo Deudor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {cronograma.map((c) => (
                      <tr key={c.nroCuota} className="hover:bg-slate-800/50 transition">
                        <td className="py-2 px-3 font-semibold text-indigo-300">{c.nroCuota}</td>
                        <td className="py-2 px-3 text-slate-300">{c.fechaVencimiento}</td>
                        <td className="py-2 px-3 text-right font-bold text-white">
                          {simbolo} {c.cuotaTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-400">
                          {simbolo} {c.amortizacion.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-right text-amber-300">
                          {simbolo} {c.interes.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400">
                          {simbolo} {c.saldoRestante.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cerrar
          </button>
          {cronograma.length > 0 && onTransferirAPrestamo && (
            <button
              onClick={() => {
                onTransferirAPrestamo({
                  monto,
                  tasaMensualPct,
                  plazoMeses,
                  tipoSistema,
                  moneda
                });
                onClose();
              }}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
            >
              <Check className="w-4 h-4" />
              Transferir a Nuevo Préstamo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
