import React, { useState, useEffect } from 'react';
import { abrirCarpetaExpediente } from '../api/prestamosApi';
import { FolderOpen, Users, Search, Phone, MapPin, Mail } from 'lucide-react';
import { listarClientes } from '../api/prestamosApi';
import { Cliente } from '../types';

export const ClientesModal: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarClientes()
      .then((res) => setClientes(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dni.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      {/* Barra de Búsqueda */}
      <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o DNI de cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-400">
          Total Clientes: <span className="font-bold text-white">{clientes.length}</span>
        </div>
      </div>

      {/* Grid de Clientes */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Cargando base de clientes...</div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">No se encontraron clientes registrados.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientesFiltrados.map((c) => (
            <div key={c.id || c.dni} className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 shadow-sm hover:border-slate-600 transition space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{c.nombreCompleto}</h4>
                  <p className="text-xs font-mono text-indigo-400">DNI / CI: {c.dni}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                {c.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.telefono}</span>
                  </div>
                )}
                {c.direccion && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.direccion}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex justify-between items-center text-[11px] text-slate-400">
                <span>Créditos Otorgados:</span>
                <span className="font-bold text-emerald-400">{c.cantidadPrestamos ?? 0}</span>
                <button
                  onClick={async (e) => {
                    const btn = e.currentTarget;
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '<span>Abriendo...</span>';
                    try {
                      await abrirCarpetaExpediente(c.dni);
                      btn.innerHTML = '<span class="text-emerald-300">✓ Abierta</span>';
                    } catch {
                      btn.innerHTML = '<span class="text-amber-300">Escritorio</span>';
                    }
                    setTimeout(() => { btn.innerHTML = originalText; }, 2500);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition active:scale-95"
                  title="Abrir carpeta de este cliente en el Escritorio"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Abrir Carpeta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
