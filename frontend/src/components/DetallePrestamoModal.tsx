import React from 'react';
import { abrirCarpetaExpediente } from '../api/prestamosApi';
import { FolderOpen, X, Receipt, CheckCircle, FileText, Lock, Edit3 } from 'lucide-react';
import { Prestamo, Cuota } from '../types';

interface DetallePrestamoModalProps {
  prestamo: Prestamo | null;
  isOpen: boolean;
  onClose: () => void;
  onCobrarCuota: (cuota: Cuota, prestamo: Prestamo) => void;
  onImprimirContrato: (prestamo: Prestamo) => void;
  onEditarPrestamo?: (prestamo: Prestamo) => void;
}

export const DetallePrestamoModal: React.FC<DetallePrestamoModalProps> = ({
  prestamo,
  isOpen,
  onClose,
  onCobrarCuota,
  onImprimirContrato,
  onEditarPrestamo
}) => {
  if (!isOpen || !prestamo) return null;

  const simbolo = prestamo.moneda === 'BOB' ? 'Bs.' : '€';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
            <button
              onClick={async (e) => {
                const btn = e.currentTarget;
                const orig = btn.innerHTML;
                btn.innerHTML = '<span class="text-indigo-200">Abriendo...</span>';
                try {
                  await abrirCarpetaExpediente(prestamo.cliente.dni);
                  btn.innerHTML = '<span class="text-emerald-300">✓ Carpeta Abierta</span>';
                } catch {
                  btn.innerHTML = '<span class="text-amber-300">Escritorio</span>';
                }
                setTimeout(() => { btn.innerHTML = orig; }, 3000);
              }}
              title="Abrir carpeta de este cliente en el Escritorio"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 transition active:scale-95"
            >
              <FolderOpen className="w-4 h-4" />
              Carpeta Cliente
            </button>
                <h3 className="text-lg font-bold text-white">Gestión del Préstamo</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                  {prestamo.codigo}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  prestamo.estado === 'ACTIVO' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                }`}>
                  {prestamo.estado}
                </span>
              </div>
              <p className="text-xs text-slate-400">Cliente: {prestamo.cliente.nombreCompleto} (DNI: {prestamo.cliente.dni})</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {prestamo.cuotas?.some((c) => c.estado === 'PAGADA') || prestamo.saldoActual < prestamo.montoSolicitado ? (
              <span
                title="Este contrato tiene pagos registrados en el sistema y no puede ser modificado"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20"
              >
                <Lock className="w-3.5 h-3.5" />
                Contrato Bloqueado
              </span>
            ) : onEditarPrestamo ? (
              <button
                onClick={() => onEditarPrestamo(prestamo)}
                title="Editar términos del contrato antes de registrar el primer pago"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 transition active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                Editar Contrato
              </button>
            ) : null}

            <button
              onClick={() => onImprimirContrato(prestamo)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              Contrato (A4)
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resumen Superior */}
        <div className="p-6 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-900/40">
          <div>
            <p className="text-xs text-slate-400">Monto Aprobado</p>
            <p className="text-lg font-bold text-white font-mono mt-0.5">
              {simbolo} {prestamo.montoSolicitado.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Saldo Pendiente</p>
            <p className="text-lg font-bold text-amber-300 font-mono mt-0.5">
              {simbolo} {prestamo.saldoActual.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Sistema / Tasa</p>
            <p className="text-sm font-semibold text-slate-200 mt-0.5">
              {prestamo.tipoSistema} ({prestamo.tasaInteresMensual}% m.)
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Plazo Total</p>
            <p className="text-sm font-semibold text-slate-200 mt-0.5">
              {prestamo.plazoMeses} meses
            </p>
          </div>
        </div>

        {/* Tabla de Cuotas y Cobranza */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
            Cronograma de Pagos y Amortización
          </h4>
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Cuota #</th>
                  <th className="py-2.5 px-3">Vencimiento</th>
                  <th className="py-2.5 px-3 text-right">Cuota Total</th>
                  <th className="py-2.5 px-3 text-right">Capital</th>
                  <th className="py-2.5 px-3 text-right">Interés</th>
                  <th className="py-2.5 px-3 text-right">Saldo Restante</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                  <th className="py-2.5 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {prestamo.cuotas && prestamo.cuotas.length > 0 ? (
                  prestamo.cuotas.map((c) => (
                    <tr
                      key={c.id}
                      className={`transition ${
                        c.estado === 'PAGADA' ? 'bg-slate-900/30 text-slate-400' : 'hover:bg-slate-800/40 text-slate-200'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold text-indigo-300">{c.nroCuota}</td>
                      <td className="py-2.5 px-3">{c.fechaVencimiento}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">
                        {simbolo} {c.cuotaTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">
                        {simbolo} {c.capitalAmortizado.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-300">
                        {simbolo} {c.interes.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        {simbolo} {c.saldoRestante.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            c.estado === 'PAGADA'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {c.estado}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {c.estado === 'PENDIENTE' ? (
                          <button
                            onClick={() => onCobrarCuota(c, prestamo)}
                            className="px-3 py-1 rounded-md text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                          >
                            Cobrar
                          </button>
                        ) : (
                          <span className="text-emerald-400 flex items-center justify-center gap-1 text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" /> Pagada
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-slate-500">
                      No hay cuotas cargadas en este registro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};
