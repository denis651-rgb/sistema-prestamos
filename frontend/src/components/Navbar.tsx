import React, { useState, useEffect } from 'react';
import { abrirCarpetaRaizExpedientes } from '../api/prestamosApi';
import { FolderOpen, 
   
  PlusCircle, 
  Calculator, 
  Users, 
  LayoutDashboard, 
  Receipt,
  Coins,
  Settings,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'prestamos' | 'simulador' | 'clientes';
  setActiveTab: (tab: 'dashboard' | 'prestamos' | 'simulador' | 'clientes') => void;
  onOpenNuevoPrestamo: () => void;
  onOpenSimulador: () => void;
  onOpenConfiguracion: () => void;
  isBackendConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNuevoPrestamo,
  onOpenSimulador,
  onOpenConfiguracion,
  isBackendConnected
}) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [abriendoCarpeta, setAbriendoCarpeta] = useState(false);
  const [mensajeCarpeta, setMensajeCarpeta] = useState<string | null>(null);

  const handleAbrirCarpeta = async () => {
    setAbriendoCarpeta(true);
    setMensajeCarpeta('Abriendo carpeta de expedientes...');
    try {
      const res = await abrirCarpetaRaizExpedientes();
      const ruta = res.data?.ruta || 'Expedientes_Clientes';
      setMensajeCarpeta(`✓ Carpeta abierta en Escritorio: ${ruta}`);
      setTimeout(() => setMensajeCarpeta(null), 4500);
    } catch (err) {
      setMensajeCarpeta('📂 Ubicación: Expedientes_Clientes en tu Escritorio');
      setTimeout(() => setMensajeCarpeta(null), 5000);
    } finally {
      setAbriendoCarpeta(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-6 py-3 no-print">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo & Marca */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                CREDICORE
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                Desktop v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Sistema de Créditos & Cobranzas Multidivisa</p>
          </div>
        </div>

        {/* Navegación Principal */}
        <nav className="flex items-center gap-1 bg-slate-800/60 p-1.5 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('prestamos')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'prestamos'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Préstamos
          </button>

          <button
            onClick={() => setActiveTab('clientes')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'clientes'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Clientes
          </button>
        </nav>

        {/* Acciones Rápidas & Status */}
        <div className="flex items-center gap-3">
          {/* Indicador de Backend */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
            <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
            <span className={`font-semibold text-[11px] ${isBackendConnected ? "text-emerald-300" : "text-rose-400"}`}>
              
              {isBackendConnected ? 'Servidor Online' : 'Servidor Offline'}
            </span>
          </div>

          {/* Reloj */}
          <div className="hidden lg:block text-xs font-mono text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
            {time}
          </div>

                    {/* Botón Configuración de Factura / Recibos */}
          <button
            onClick={onOpenConfiguracion}
            title="Configurar datos del emisor, encabezados y formato de recibos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition"
          >
            <Settings className="w-4 h-4 text-indigo-400" />
            Configuración
          </button>

          {/* Botón Carpeta Escritorio con Feedback */}
          <button
            onClick={handleAbrirCarpeta}
            disabled={abriendoCarpeta}
            title="Abrir carpeta 'Expedientes_Clientes' en el Escritorio"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/80 text-indigo-300 hover:bg-indigo-900 border border-indigo-700/60 hover:border-indigo-500 transition active:scale-95 disabled:opacity-60"
          >
            {abriendoCarpeta ? (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            ) : (
              <FolderOpen className="w-4 h-4 text-indigo-400" />
            )}
            <span className="hidden xs:inline">Expedientes (Escritorio)</span>
          </button>

          {/* Botón Simulador */}
          <button
            onClick={onOpenSimulador}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition"
          >
            <Calculator className="w-4 h-4 text-indigo-400" />
            Simulador
          </button>

          {/* Botón Nuevo Préstamo */}
          <button
            onClick={onOpenNuevoPrestamo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Nuevo Préstamo
          </button>
        </div>
      </div>

      {/* Notificación flotante de apertura de expedientes */}
      {mensajeCarpeta && (
        <div className="max-w-7xl mx-auto mt-2 px-1">
          <div className="bg-indigo-950/90 border border-indigo-500/50 text-indigo-200 text-xs px-4 py-2 rounded-xl flex items-center justify-between shadow-lg shadow-indigo-950/50 animate-fadeIn">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-medium font-mono text-[11px]">{mensajeCarpeta}</span>
            </div>
            <button
              onClick={() => setMensajeCarpeta(null)}
              className="text-indigo-400 hover:text-white text-xs px-2 py-0.5 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
