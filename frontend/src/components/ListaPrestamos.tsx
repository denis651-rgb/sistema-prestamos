import React, { useState } from 'react';
import { Search, Filter, FileText, Eye, Lock, Edit3 } from 'lucide-react';
import { Prestamo } from '../types';

interface ListaPrestamosProps {
  prestamos: Prestamo[];
  onVerPrestamo: (prestamo: Prestamo) => void;
  onImprimirContrato: (prestamo: Prestamo) => void;
  onEditarPrestamo?: (prestamo: Prestamo) => void;
}

export const ListaPrestamos: React.FC<ListaPrestamosProps> = ({
  prestamos,
  onVerPrestamo,
  onImprimirContrato,
  onEditarPrestamo
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'ACTIVO' | 'CANCELADO'>('TODOS');
  const [filtroMoneda, setFiltroMoneda] = useState<'TODAS' | 'BOB' | 'EUR'>('TODAS');

  const prestamosFiltrados = prestamos.filter((p) => {
    const matchTerm =
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cliente.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cliente.dni.includes(searchTerm);

    const matchEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado;
    const matchMoneda = filtroMoneda === 'TODAS' || p.moneda === filtroMoneda;

    return matchTerm && matchEstado && matchMoneda;
  });

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, cliente o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="ACTIVO">Solo Activos</option>
            <option value="CANCELADO">Solo Cancelados</option>
          </select>

          <select
            value={filtroMoneda}
            onChange={(e) => setFiltroMoneda(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="TODAS">Todas las Divisas</option>
            <option value="BOB">BOB (Bs.)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
      </div>

      {/* Tabla Principal de Préstamos */}
      <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase font-mono border-b border-slate-700/60">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Titular / Prestatario</th>
                <th className="py-3 px-4">Fecha Inicio</th>
                <th className="py-3 px-4">Sistema</th>
                <th className="py-3 px-4 text-right">Capital</th>
                <th className="py-3 px-4 text-right">Saldo Deudor</th>
                <th className="py-3 px-4 text-center">Progreso</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {prestamosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No se encontraron préstamos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                prestamosFiltrados.map((p) => {
                  const simbolo = p.moneda === 'BOB' ? 'Bs.' : '€';
                  const pagado = p.montoSolicitado - p.saldoActual;
                  const porcentaje = p.montoSolicitado > 0 ? Math.round((pagado / p.montoSolicitado) * 100) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-medium text-indigo-300">
                        {p.codigo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100">{p.cliente.nombreCompleto}</div>
                        <div className="text-xs text-slate-400 font-mono">DNI: {p.cliente.dni}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-300 font-mono">
                        {p.fechaInicio}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-300">
                          {p.tipoSistema} ({p.plazoMeses}m @ {p.tasaInteresMensual}%)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-100 font-mono">
                        {simbolo} {p.montoSolicitado.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-300 font-mono">
                        {simbolo} {p.saldoActual.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="w-24 mx-auto bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(0, porcentaje))}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{porcentaje}%</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            p.estado === 'ACTIVO'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {p.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onVerPrestamo(p)}
                            title="Ver cronograma y cobrar cuotas"
                            className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onImprimirContrato(p)}
                            title="Imprimir Contrato Legal (A4)"
                            className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600 transition"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          {p.cuotas?.some((c) => c.estado === 'PAGADA') || p.saldoActual < p.montoSolicitado ? (
                            <span
                              title="Contrato bloqueado: Ya cuenta con pagos registrados"
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed"
                            >
                              <Lock className="w-4 h-4" />
                            </span>
                          ) : onEditarPrestamo ? (
                            <button
                              onClick={() => onEditarPrestamo(p)}
                              title="Editar Préstamo y Contrato (Sin pagos)"
                              className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 transition"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
