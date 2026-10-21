import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Users, 
  ArrowUpRight,
  ShieldCheck,
  } from 'lucide-react';
import { ResumenDashboard, Prestamo } from '../types';

interface DashboardProps {
  resumen: ResumenDashboard | null;
  prestamos: Prestamo[];
  onVerPrestamo: (prestamo: Prestamo) => void;
  onOpenNuevoPrestamo: () => void;
  onOpenSimulador: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  resumen,
  prestamos,
  onVerPrestamo,
  onOpenNuevoPrestamo,
  onOpenSimulador
}) => {
  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida y Resumen Operativo */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-800/80 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Panel Financiero & Control de Cobranzas
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Motor de cálculo financiero con precisión bancaria (BigDecimal). Monitoreo en tiempo real de cartera colocada, amortizaciones y caja diaria en BOB y EUR.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onOpenNuevoPrestamo}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition"
            >
              Otorgar Crédito
            </button>
            <button
              onClick={onOpenSimulador}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Simulador Francés/Alemán
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas BOB */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Cartera en Bolivianos (BOB - Bs.)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 shadow-sm hover:border-slate-600 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400">Capital Colocado Total</p>
                <h4 className="text-2xl font-bold text-white mt-1">
                  Bs. {resumen?.totalColocadoBOB?.toLocaleString('es-BO', { minimumFractionDigits: 2 }) || '0.00'}
                </h4>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1">
              <span className="text-emerald-400 font-medium">Historico</span> total acumulado
            </p>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 shadow-sm hover:border-slate-600 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400">Saldo Pendiente por Cobrar</p>
                <h4 className="text-2xl font-bold text-amber-300 mt-1">
                  Bs. {resumen?.saldoPendienteBOB?.toLocaleString('es-BO', { minimumFractionDigits: 2 }) || '0.00'}
                </h4>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Capital activo en circulación
            </p>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 shadow-sm hover:border-slate-600 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400">Caja Diaria Cobrada (Hoy)</p>
                <h4 className="text-2xl font-bold text-emerald-400 mt-1">
                  Bs. {resumen?.cobradoHoyBOB?.toLocaleString('es-BO', { minimumFractionDigits: 2 }) || '0.00'}
                </h4>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-emerald-400/80 mt-3 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Ingresos registrados hoy
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas EUR */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Cartera en Euros (EUR - €)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 shadow-sm hover:border-slate-600 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400">Capital Colocado Total</p>
                <h4 className="text-2xl font-bold text-white mt-1">
                  € {resumen?.totalColocadoEUR?.toLocaleString('de-DE', { minimumFractionDigits: 2 }) || '0.00'}
                </h4>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Colocación en moneda extranjera</p>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 shadow-sm hover:border-slate-600 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400">Saldo Pendiente por Cobrar</p>
                <h4 className="text-2xl font-bold text-cyan-300 mt-1">
                  € {resumen?.saldoPendienteEUR?.toLocaleString('de-DE', { minimumFractionDigits: 2 }) || '0.00'}
                </h4>
              </div>
              <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Porcentaje activo devengando</p>
          </div>

          <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 shadow-sm hover:border-slate-600 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400">Caja Diaria Cobrada (Hoy)</p>
                <h4 className="text-2xl font-bold text-teal-300 mt-1">
                  € {resumen?.cobradoHoyEUR?.toLocaleString('de-DE', { minimumFractionDigits: 2 }) || '0.00'}
                </h4>
              </div>
              <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-teal-400/80 mt-3 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Ingresos en euros hoy
            </p>
          </div>
        </div>
      </div>

      {/* Resumen Operativo: Alertas de Cuotas y Préstamos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Préstamos Activos</p>
            <p className="text-xl font-bold text-white">{resumen?.prestamosActivos || 0}</p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Cancelados / Concluidos</p>
            <p className="text-xl font-bold text-emerald-400">{resumen?.prestamosCancelados || 0}</p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Clientes</p>
            <p className="text-xl font-bold text-white">{resumen?.totalClientes || 0}</p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Cuotas Vencidas</p>
            <p className="text-xl font-bold text-rose-400">{resumen?.cuotasVencidas || 0}</p>
          </div>
        </div>
      </div>

      {/* Lista de Préstamos Recientes */}
      <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Préstamos Recientes</h3>
            <p className="text-xs text-slate-400">Operaciones crediticias registradas en el sistema local</p>
          </div>
          <button
            onClick={() => onVerPrestamo(prestamos[0])}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            {prestamos.length > 0 ? `Total: ${prestamos.length} operaciones` : ''}
          </button>
        </div>

        {prestamos.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-medium">No hay préstamos registrados aún.</p>
            <p className="text-xs text-slate-500 mt-1">Crea el primer préstamo para comenzar el control de cuotas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase font-mono border-b border-slate-700/60">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Sistema</th>
                  <th className="py-3 px-4 text-right">Monto</th>
                  <th className="py-3 px-4 text-right">Saldo Actual</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {prestamos.slice(0, 5).map((p) => {
                  const simbolo = p.moneda === 'BOB' ? 'Bs.' : '€';
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono font-medium text-indigo-300">
                        {p.codigo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{p.cliente.nombreCompleto}</div>
                        <div className="text-xs text-slate-500">DNI: {p.cliente.dni}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-700/60 text-slate-300">
                          {p.tipoSistema} ({p.plazoMeses}m @ {p.tasaInteresMensual}%)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-100">
                        {simbolo} {p.montoSolicitado.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-300">
                        {simbolo} {p.saldoActual.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            p.estado === 'ACTIVO'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {p.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onVerPrestamo(p)}
                          className="px-3 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
