import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ListaPrestamos } from './components/ListaPrestamos';
import { ClientesModal } from './components/ClientesModal';
import { SimuladorModal } from './components/SimuladorModal';
import { NuevoPrestamoModal } from './components/NuevoPrestamoModal';
import { EditarPrestamoModal } from './components/EditarPrestamoModal';
import { DetallePrestamoModal } from './components/DetallePrestamoModal';
import { RegistrarPagoModal } from './components/RegistrarPagoModal';
import { ConfiguracionModal } from './components/ConfiguracionModal';
import { ContratoPrint } from './documents/ContratoPrint';
import { ReciboPrint } from './documents/ReciboPrint';
import { 
  listarPrestamos, 
  obtenerResumenDashboard, 
  obtenerPrestamoPorId,
  checkHealth 
} from './api/prestamosApi';
import { Prestamo, ResumenDashboard, Cuota, PagoResponse, TipoSistema, Moneda } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'prestamos' | 'simulador' | 'clientes'>('dashboard');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);

  // Modales
  const [isSimuladorOpen, setIsSimuladorOpen] = useState(false);
  const [isNuevoPrestamoOpen, setIsNuevoPrestamoOpen] = useState(false);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(null);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [prestamoParaEditar, setPrestamoParaEditar] = useState<Prestamo | null>(null);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Pago
  const [cuotaParaPago, setCuotaParaPago] = useState<Cuota | null>(null);
  const [prestamoParaPago, setPrestamoParaPago] = useState<Prestamo | null>(null);
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);

  // Documentos para Impresión
  const [contratoParaImprimir, setContratoParaImprimir] = useState<Prestamo | null>(null);
  const [reciboParaImprimir, setReciboParaImprimir] = useState<PagoResponse | null>(null);

  // Valores pre-cargados desde el simulador
  const [simuladorTransferData, setSimuladorTransferData] = useState<{
    monto?: number;
    tasaMensualPct?: number;
    plazoMeses?: number;
    tipoSistema?: TipoSistema;
    moneda?: Moneda;
  }>({});

  const cargarDatos = async () => {
    try {
      const [resumenRes, prestamosRes] = await Promise.all([
        obtenerResumenDashboard(),
        listarPrestamos()
      ]);

      setResumen(resumenRes.data);
      setPrestamos(prestamosRes.data);
      setIsBackendConnected(true);
    } catch (err) {
      console.error('Error conectando al backend:', err);
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 10000); // Poll cada 10 seg
    return () => clearInterval(interval);
  }, []);

  const handleEditarPrestamo = (p: Prestamo) => {
    setPrestamoParaEditar(p);
    setIsEditarOpen(true);
  };

  const handleVerPrestamo = async (p: Prestamo) => {
    try {
      const res = await obtenerPrestamoPorId(p.id);
      setPrestamoSeleccionado(res.data);
      setIsDetalleOpen(true);
    } catch {
      setPrestamoSeleccionado(p);
      setIsDetalleOpen(true);
    }
  };

  const handleCobrarCuota = (cuota: Cuota, prestamo: Prestamo) => {
    setCuotaParaPago(cuota);
    setPrestamoParaPago(prestamo);
    setIsPagoModalOpen(true);
  };

  const handlePagoCompletado = (pagoResp: PagoResponse) => {
    setIsPagoModalOpen(false);
    setReciboParaImprimir(pagoResp);
    cargarDatos();
    if (prestamoSeleccionado) {
      obtenerPrestamoPorId(prestamoSeleccionado.id).then((res) => {
        setPrestamoSeleccionado(res.data);
      });
    }
  };

  // Vistas de impresión a pantalla completa si están activas
  if (contratoParaImprimir) {
    return (
      <ContratoPrint
        prestamo={contratoParaImprimir}
        onVolver={() => setContratoParaImprimir(null)}
      />
    );
  }

  if (reciboParaImprimir) {
    return (
      <ReciboPrint
        pago={reciboParaImprimir}
        onVolver={() => setReciboParaImprimir(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Barra de Navegación */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNuevoPrestamo={() => setIsNuevoPrestamoOpen(true)}
        onOpenSimulador={() => setIsSimuladorOpen(true)}
        onOpenConfiguracion={() => setIsConfigOpen(true)}
        isBackendConnected={isBackendConnected}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            resumen={resumen}
            prestamos={prestamos}
            onVerPrestamo={handleVerPrestamo}
            onOpenNuevoPrestamo={() => setIsNuevoPrestamoOpen(true)}
            onOpenSimulador={() => setIsSimuladorOpen(true)}
          />
        )}

        {activeTab === 'prestamos' && (
          <ListaPrestamos
            prestamos={prestamos}
            onVerPrestamo={handleVerPrestamo}
            onImprimirContrato={(p) => setContratoParaImprimir(p)}
            onEditarPrestamo={handleEditarPrestamo}
          />
        )}

        {activeTab === 'clientes' && <ClientesModal />}
      </main>

      {/* Modales */}
      <SimuladorModal
        isOpen={isSimuladorOpen}
        onClose={() => setIsSimuladorOpen(false)}
        onTransferirAPrestamo={(datos) => {
          setSimuladorTransferData(datos);
          setIsNuevoPrestamoOpen(true);
        }}
      />

      <NuevoPrestamoModal
        isOpen={isNuevoPrestamoOpen}
        onClose={() => {
          setIsNuevoPrestamoOpen(false);
          setSimuladorTransferData({});
        }}
        initialValues={simuladorTransferData}
        onSuccess={(nuevo) => {
          cargarDatos();
          handleVerPrestamo(nuevo);
        }}
      />

      <DetallePrestamoModal
        prestamo={prestamoSeleccionado}
        isOpen={isDetalleOpen}
        onClose={() => setIsDetalleOpen(false)}
        onCobrarCuota={handleCobrarCuota}
        onImprimirContrato={(p) => setContratoParaImprimir(p)}
        onEditarPrestamo={handleEditarPrestamo}
      />

            <EditarPrestamoModal
        prestamo={prestamoParaEditar}
        isOpen={isEditarOpen}
        onClose={() => {
          setIsEditarOpen(false);
          setPrestamoParaEditar(null);
        }}
        onSuccess={(actualizado) => {
          cargarDatos();
          if (prestamoSeleccionado && prestamoSeleccionado.id === actualizado.id) {
            handleVerPrestamo(actualizado);
          }
        }}
      />

      <RegistrarPagoModal
        isOpen={isPagoModalOpen}
        onClose={() => setIsPagoModalOpen(false)}
        cuota={cuotaParaPago}
        prestamo={prestamoParaPago}
        onPagoCompletado={handlePagoCompletado}
      />
      <ConfiguracionModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </div>
  );
};
