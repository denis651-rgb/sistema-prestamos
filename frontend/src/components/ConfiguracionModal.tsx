import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Building2, 
  FileText, 
  Receipt, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  QrCode, 
  ShieldAlert, 
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { ConfiguracionEmpresa } from '../types';
import { obtenerConfiguracion, guardarConfiguracion } from '../api/prestamosApi';

interface ConfiguracionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (conf: ConfiguracionEmpresa) => void;
}

export const ConfiguracionModal: React.FC<ConfiguracionModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [formData, setFormData] = useState<ConfiguracionEmpresa>({
    tipoComprobante: 'RECIBO DE PAGO OFICIAL',
    subtituloComprobante: 'Constancia de Cancelación de Cuota',
    nombreEmisor: 'NOEMI CONDORI BALCAS',
    documentoIdentidad: '30378592P',
    etiquetaDocumento: 'DNI',
    actividad: 'Servicios de Préstamos Personales & Créditos',
    direccion: 'C. Teodora Lamadrid 37',
    telefono: '(+34) 612 345 678',
    ciudadPais: 'Barcelona, España',
    pieComprobante: 'Documento emitido como constancia formal de pago y amortización de cuota de préstamo privado.',
    mostrarQr: true,
    mostrarCreditoFiscal: false
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      cargarConfig();
    }
  }, [isOpen]);

  const cargarConfig = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await obtenerConfiguracion();
      if (res.data) {
        setFormData(res.data);
      }
    } catch (err: any) {
      console.warn('No se pudo cargar la configuración del servidor, usando valores predeterminados', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await guardarConfiguracion(formData);
      setSuccessMsg('¡Configuración guardada exitosamente! Todas las facturas y recibos ahora usarán estos datos.');
      if (onConfigSaved) {
        onConfigSaved(res.data);
      }
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleRestablecer = () => {
    setFormData({
      tipoComprobante: 'RECIBO DE PAGO OFICIAL',
      subtituloComprobante: 'Constancia de Cancelación de Cuota',
      nombreEmisor: 'NOEMI CONDORI BALCAS',
      documentoIdentidad: '30378592P',
      etiquetaDocumento: 'DNI',
      actividad: 'Servicios de Préstamos Personales & Créditos',
      direccion: 'C. Teodora Lamadrid 37',
      telefono: '(+34) 612 345 678',
      ciudadPais: 'Barcelona, España',
      pieComprobante: 'Documento emitido como constancia formal de pago y amortización de cuota de préstamo privado.',
      mostrarQr: true,
      mostrarCreditoFiscal: false
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Configuración del Emisor y Comprobantes
              </h2>
              <p className="text-xs text-slate-400">
                Personalice los datos del emisor, encabezados y términos de sus facturas y recibos de pago
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl flex items-center gap-3 text-rose-200 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-950/50 border border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-200 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form id="configForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECCIÓN 1: Datos del Emisor / Prestamista */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
                  <Building2 className="w-4 h-4" />
                  <span>1. Datos del Emisor (Prestamista o Empresa)</span>
                </div>
                <span className="text-[11px] text-slate-400">Aparecerán en la cabecera de cada recibo/factura</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nombre Completo o Razón Social *
                  </label>
                  <input
                    type="text"
                    name="nombreEmisor"
                    value={formData.nombreEmisor}
                    onChange={handleChange}
                    required
                    placeholder="Ej. NOEMI CONDORI BALCAS o Inversiones S.A."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tipo de Documento Fiscal / Personal
                  </label>
                  <select
                    name="etiquetaDocumento"
                    value={formData.etiquetaDocumento}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="DNI">DNI (Documento Nacional de Identidad - España / Otros)</option>
                    <option value="C.I.">C.I. (Cédula de Identidad - Bolivia / Otros)</option>
                    <option value="NIT">NIT (Número de Identificación Tributaria)</option>
                    <option value="NIF">NIF / CIF</option>
                    <option value="RUT">RUT</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    name="documentoIdentidad"
                    value={formData.documentoIdentidad}
                    onChange={handleChange}
                    required
                    placeholder="Ej. 30378592P o 1028394029"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Actividad / Giro o Rubro
                  </label>
                  <input
                    type="text"
                    name="actividad"
                    value={formData.actividad}
                    onChange={handleChange}
                    placeholder="Ej. Servicios de Préstamos Personales & Créditos"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Dirección del Domicilio / Oficina
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Ej. C. Teodora Lamadrid 37"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Ciudad y País
                  </label>
                  <input
                    type="text"
                    name="ciudadPais"
                    value={formData.ciudadPais}
                    onChange={handleChange}
                    placeholder="Ej. Barcelona, España o Cochabamba, Bolivia"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej. (+34) 612 345 678"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: Tipo de Comprobante & Régimen Fiscal */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
                  <Receipt className="w-4 h-4" />
                  <span>2. Formato del Comprobante & Régimen Fiscal</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Título Principal del Comprobante
                  </label>
                  <input
                    type="text"
                    name="tipoComprobante"
                    value={formData.tipoComprobante}
                    onChange={handleChange}
                    placeholder="Ej. RECIBO DE PAGO OFICIAL o FACTURA COMERCIAL"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white font-semibold placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase"
                  />
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <span 
                      onClick={() => setFormData(p => ({ ...p, tipoComprobante: 'RECIBO DE PAGO OFICIAL' }))}
                      className="cursor-pointer text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2 py-0.5 rounded border border-slate-700"
                    >
                      Recibo de Pago Oficial
                    </span>
                    <span 
                      onClick={() => setFormData(p => ({ ...p, tipoComprobante: 'COMPROBANTE DE COBRO' }))}
                      className="cursor-pointer text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2 py-0.5 rounded border border-slate-700"
                    >
                      Comprobante de Cobro
                    </span>
                    <span 
                      onClick={() => setFormData(p => ({ ...p, tipoComprobante: 'RECIBO DE DINERO' }))}
                      className="cursor-pointer text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2 py-0.5 rounded border border-slate-700"
                    >
                      Recibo de Dinero
                    </span>
                    <span 
                      onClick={() => setFormData(p => ({ ...p, tipoComprobante: 'FACTURA OFICIAL' }))}
                      className="cursor-pointer text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2 py-0.5 rounded border border-slate-700"
                    >
                      Factura Oficial
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Subtítulo o Leyenda Secundaria
                  </label>
                  <input
                    type="text"
                    name="subtituloComprobante"
                    value={formData.subtituloComprobante}
                    onChange={handleChange}
                    placeholder="Ej. Constancia de Cancelación de Cuota"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Switch Crédito Fiscal */}
                <div className="md:col-span-2 p-3.5 bg-slate-900/80 border border-slate-700 rounded-xl flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">¿Emitir con Derecho a Crédito Fiscal?</span>
                      {formData.mostrarCreditoFiscal ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          HABILITADO
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300 border border-slate-600">
                          DESACTIVADO (Sin Crédito Fiscal)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Si usted es un prestamista particular o no cuenta con dosificación tributaria activa de facturación con crédito fiscal, <strong>mantenga esta opción desactivada</strong> para evitar emitir documentos con afirmaciones tributarias falsas.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      name="mostrarCreditoFiscal"
                      checked={formData.mostrarCreditoFiscal}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Switch QR */}
                <div className="md:col-span-2 p-3.5 bg-slate-900/80 border border-slate-700 rounded-xl flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">Mostrar Código QR de Verificación</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Incluye un código QR en el comprobante con los datos de emisión, cuota y fecha para rápida verificación.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      name="mostrarQr"
                      checked={formData.mostrarQr}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Pie de Comprobante */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Mensaje / Términos al Pie del Comprobante
                  </label>
                  <textarea
                    rows={2}
                    name="pieComprobante"
                    value={formData.pieComprobante}
                    onChange={handleChange}
                    placeholder="Ej. Documento emitido como constancia formal de pago y amortización de cuota de préstamo privado."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sustituye cualquier texto de penalizaciones o leyes que no correspondan a su tipo de actividad.
                  </p>
                </div>
              </div>
            </div>

            {/* VISTA PREVIA EN VIVO */}
            <div className="bg-slate-950 border border-indigo-900/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-indigo-400 text-xs font-semibold">
                <span>Vista Previa en Vivo de la Cabecera:</span>
                <span className="text-[10px] bg-indigo-950 px-2 py-0.5 rounded text-indigo-300 border border-indigo-800">
                  {formData.tipoComprobante}
                </span>
              </div>
              <div className="bg-white text-slate-900 p-4 rounded-lg text-xs font-sans shadow-inner border border-slate-300 space-y-2">
                <div className="flex justify-between items-start border-b border-slate-300 pb-2">
                  <div>
                    <h3 className="font-black text-sm uppercase text-slate-950 leading-tight">
                      {formData.nombreEmisor || 'NOMBRE DEL EMISOR'}
                    </h3>
                    <p className="text-[10px] text-slate-600 font-medium">{formData.actividad}</p>
                    <p className="text-[10px] text-slate-500">{formData.direccion} • {formData.ciudadPais}</p>
                    <p className="text-[10px] text-slate-500">Tel: {formData.telefono}</p>
                  </div>
                  <div className="text-right border-l border-slate-300 pl-3">
                    <span className="inline-block bg-slate-900 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                      {formData.tipoComprobante}
                    </span>
                    <p className="text-[9px] text-slate-600 mt-1">
                      {formData.mostrarCreditoFiscal ? '(Con Derecho a Crédito Fiscal)' : '(Sin Derecho a Crédito Fiscal)'}
                    </p>
                    <p className="text-[10px] font-mono font-bold text-indigo-900 mt-0.5">
                      {formData.etiquetaDocumento}: {formData.documentoIdentidad}
                    </p>
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 italic text-center pt-1">
                  "{formData.pieComprobante}"
                </p>
              </div>
            </div>

          </form>
        </div>

        {/* Pie del Modal con Botones */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={handleRestablecer}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer Valores Predeterminados
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="configForm"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
