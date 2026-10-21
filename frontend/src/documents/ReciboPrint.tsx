import React, { useState, useEffect } from 'react';
import { abrirCarpetaExpediente, obtenerConfiguracion } from '../api/prestamosApi';
import { 
  FolderOpen, 
  Printer, 
  ArrowLeft, 
  Building2, 
  ShieldCheck, 
  QrCode, 
  FileText, 
  ReceiptText, 
  Calendar, 
  User, 
  Coins 
} from 'lucide-react';
import { PagoResponse, ConfiguracionEmpresa } from '../types';

interface ReciboPrintProps {
  pago: PagoResponse;
  onVolver: () => void;
}

// Convertidor de número a letras en español
function numeroALetras(cantidad: number, moneda: string): string {
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas10a19 = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  const entero = Math.floor(cantidad);
  const decimales = Math.round((cantidad - entero) * 100);
  const strDecimales = decimales.toString().padStart(2, '0') + '/100';

  const sufijoMoneda = moneda === 'BOB' ? 'BOLIVIANOS' : 'EUROS';

  if (entero === 0) return `CERO ${strDecimales} ${sufijoMoneda}`;

  function resolverMenorMil(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'CIEN';
    let res = '';
    const c = Math.floor(n / 100);
    const restoC = n % 100;
    if (c > 0) res += centenas[c] + ' ';

    if (restoC >= 10 && restoC <= 19) {
      res += decenas10a19[restoC - 10] + ' ';
    } else if (restoC >= 21 && restoC <= 29) {
      res += 'VEINTI' + unidades[restoC - 20] + ' ';
    } else {
      const d = Math.floor(restoC / 10);
      const u = restoC % 10;
      if (d > 0) res += decenas[d] + (u > 0 ? ' Y ' : ' ');
      if (u > 0) res += unidades[u] + ' ';
    }
    return res.trim();
  }

  function resolverMiles(n: number): string {
    const miles = Math.floor(n / 1000);
    const resto = n % 1000;
    let res = '';
    if (miles === 1) {
      res = 'MIL ';
    } else if (miles > 1) {
      res = resolverMenorMil(miles) + ' MIL ';
    }
    if (resto > 0) {
      res += resolverMenorMil(resto);
    }
    return res.trim();
  }

  let literal = '';
  if (entero >= 1000000) {
    const millones = Math.floor(entero / 1000000);
    const restoMill = entero % 1000000;
    literal += (millones === 1 ? 'UN MILLÓN ' : resolverMenorMil(millones) + ' MILLONES ');
    if (restoMill > 0) literal += resolverMiles(restoMill);
  } else {
    literal = resolverMiles(entero);
  }

  return `SON: ${literal.trim()} ${strDecimales} ${sufijoMoneda}`;
}

// Generador de Código de Verificación
function generarCodigoVerificacion(pago: PagoResponse): string {
  const base = `${pago.nroRecibo}-${pago.prestamoCodigo}-${pago.fechaPago}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `8F9A-4B2E-7C10-${hex}`;
}

const configDefault: ConfiguracionEmpresa = {
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
};

export const ReciboPrint: React.FC<ReciboPrintProps> = ({ pago, onVolver }) => {
  const [formato, setFormato] = useState<'a4' | 'ticket'>('a4');
  const [conf, setConf] = useState<ConfiguracionEmpresa>(configDefault);

  useEffect(() => {
    obtenerConfiguracion()
      .then(res => {
        if (res.data) setConf(res.data);
      })
      .catch(err => {
        console.warn('Usando configuración predeterminada de recibo:', err);
      });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const simbolo = pago.moneda === 'BOB' ? 'Bs.' : '€';
  const cuf = generarCodigoVerificacion(pago);
  const literal = numeroALetras(pago.montoPagado || 0, pago.moneda);
  const fechaEmision = new Date(pago.fechaPago);

  return (
    <div className="min-h-screen bg-slate-900 py-6 px-4">
      {/* Barra de Control Superior (Oculta en Impresión) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 no-print bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-xl">
        <button
          onClick={onVolver}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Préstamos
        </button>

        {/* Selector de Formato de Comprobante */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setFormato('a4')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              formato === 'a4'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Formato Institucional (A4)
          </button>
          <button
            onClick={() => setFormato('ticket')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              formato === 'ticket'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            Térmica POS (80mm)
          </button>
        </div>

        {/* Botón Abrir Carpeta en Escritorio */}
        <button
          onClick={async (e) => {
            const btn = e.currentTarget;
            const orig = btn.innerHTML;
            btn.innerHTML = '<span class="text-indigo-200 text-xs">Abriendo...</span>';
            try {
              await abrirCarpetaExpediente(pago.clienteDni);
              btn.innerHTML = '<span class="text-emerald-300 text-xs">✓ Carpeta Abierta</span>';
            } catch {
              btn.innerHTML = '<span class="text-amber-300 text-xs">Escritorio</span>';
            }
            setTimeout(() => { btn.innerHTML = orig; }, 3000);
          }}
          title="Abrir expediente digital en el Escritorio"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-950/80 text-indigo-300 hover:bg-indigo-900 border border-indigo-700/60 text-xs font-semibold transition active:scale-95"
        >
          <FolderOpen className="w-4 h-4 text-indigo-400" />
          Expediente en Escritorio
        </button>

        {/* Botón Imprimir */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition active:scale-95"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* ==================================================================== */}
      {/* FORMATO 1: COMPROBANTE INSTITUCIONAL (A4 / CARTA)                    */}
      {/* ==================================================================== */}
      {formato === 'a4' && (
        <div className="factura-a4 bg-white text-slate-800 p-8 sm:p-12 max-w-4xl mx-auto shadow-2xl rounded-xl font-sans text-xs border border-slate-200">
          {/* Cabecera Principal */}
          <div className="grid grid-cols-12 gap-4 pb-6 border-b-2 border-slate-800 items-start">
            {/* Logo y Datos del Emisor Dinámicos */}
            <div className="col-span-7 space-y-1.5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-black text-xl shadow-md">
                  {conf.nombreEmisor ? conf.nombreEmisor.charAt(0).toUpperCase() : 'E'}
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none uppercase">
                    {conf.nombreEmisor}
                  </h1>
                  <p className="text-[10px] font-semibold text-indigo-700 tracking-wider uppercase">
                    {conf.actividad || 'Servicios Financieros & Préstamos'}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                <strong>Domicilio:</strong> {conf.direccion}
              </p>
              <p className="text-[11px] text-slate-600">
                <strong>Ubicación:</strong> {conf.ciudadPais} • <strong>Teléfono:</strong> {conf.telefono}
              </p>
            </div>

            {/* Recuadro del Comprobante Dinámico */}
            <div className="col-span-5 border-2 border-indigo-900 rounded-xl p-3.5 bg-indigo-50/40 text-center space-y-1">
              <div className="text-[12px] font-black text-indigo-950 uppercase tracking-wider">
                {conf.tipoComprobante || 'RECIBO DE PAGO'}
              </div>
              <div className="text-[10px] text-slate-600 font-medium">
                {conf.mostrarCreditoFiscal 
                  ? '(Con Derecho a Crédito Fiscal)' 
                  : `(${conf.subtituloComprobante || 'Constancia de Pago'})`}
              </div>
              <div className="py-1 border-y border-indigo-200 my-1 space-y-0.5">
                <div className="flex justify-between text-[11px] px-2">
                  <span className="font-semibold text-slate-700">{conf.etiquetaDocumento || 'DNI / NIT'}:</span>
                  <span className="font-bold font-mono text-slate-900">{conf.documentoIdentidad}</span>
                </div>
                <div className="flex justify-between text-[11px] px-2">
                  <span className="font-semibold text-slate-700">N° COMPROBANTE:</span>
                  <span className="font-bold font-mono text-indigo-700 text-sm">{pago.nroRecibo}</span>
                </div>
                <div className="flex justify-between text-[11px] px-2">
                  <span className="font-semibold text-slate-700">CÓD. CONTROL:</span>
                  <span className="font-mono text-[9px] text-slate-800 font-semibold">{cuf}</span>
                </div>
              </div>
              <div className="text-[9px] font-semibold text-indigo-900 uppercase">
                Emisión de Constancia Digital
              </div>
            </div>
          </div>

          {/* Información del Cliente y de la Operación */}
          <div className="grid grid-cols-2 gap-4 py-4 my-2 border-b border-slate-200 bg-slate-50/70 p-4 rounded-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[10px] uppercase">
                <User className="w-3.5 h-3.5" />
                Datos del Prestatario / Cliente
              </div>
              <p className="text-sm font-bold text-slate-900">{pago.clienteNombre}</p>
              <p className="text-[11px] text-slate-700 font-medium">
                <strong>Documento de Identidad:</strong> <span className="font-mono">{pago.clienteDni}</span>
              </p>
              <p className="text-[11px] text-slate-600">
                <strong>Modalidad de Pago:</strong> <span className="font-semibold text-indigo-800">{pago.metodoPago}</span>
              </p>
            </div>

            <div className="space-y-1 sm:text-right">
              <div className="flex items-center sm:justify-end gap-1.5 text-slate-500 font-semibold text-[10px] uppercase">
                <Calendar className="w-3.5 h-3.5" />
                Detalles de Emisión & Operación
              </div>
              <p className="text-[11px] text-slate-800">
                <strong>Fecha y Hora:</strong> {fechaEmision.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {fechaEmision.toLocaleTimeString()}
              </p>
              <p className="text-[11px] text-slate-800">
                <strong>Código de Crédito:</strong> <span className="font-mono font-bold text-indigo-700">{pago.prestamoCodigo}</span>
              </p>
              <p className="text-[11px] text-slate-800">
                <strong>Cuota Cancelada:</strong> <span className="font-bold font-mono">Cuota N° {pago.nroCuota}</span>
              </p>
            </div>
          </div>

          {/* Tabla de Detalle de Cobranza Formal */}
          <div className="my-5 overflow-hidden rounded-xl border border-slate-300">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">Ítem</th>
                  <th className="py-2.5 px-3 w-28">Código</th>
                  <th className="py-2.5 px-3">Concepto / Descripción de la Cuota</th>
                  <th className="py-2.5 px-3 text-center w-20">Cant.</th>
                  <th className="py-2.5 px-3 text-right w-28">P. Unitario ({simbolo})</th>
                  <th className="py-2.5 px-3 text-right w-24">Desc.</th>
                  <th className="py-2.5 px-3 text-right w-32">Subtotal ({simbolo})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 text-center font-mono font-semibold text-slate-500">01</td>
                  <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">CAP-{pago.nroCuota}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">Amortización a Capital</p>
                    <p className="text-[10px] text-slate-500">
                      Abono a capital para el préstamo {pago.prestamoCodigo} (Cuota #{pago.nroCuota})
                    </p>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">1.00</td>
                  <td className="py-3 px-3 text-right font-mono">
                    {pago.capitalAmortizado?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">0.00</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                    {pago.capitalAmortizado?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 text-center font-mono font-semibold text-slate-500">02</td>
                  <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">INT-{pago.nroCuota}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">Interés Devengado del Periodo</p>
                    <p className="text-[10px] text-slate-500">
                      Rendimiento financiero convenido para la cuota #{pago.nroCuota}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">1.00</td>
                  <td className="py-3 px-3 text-right font-mono">
                    {pago.interesPagado?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">0.00</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                    {pago.interesPagado?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cuadro de Totales y Conversión Literal */}
          <div className="grid grid-cols-12 gap-6 my-4 items-start">
            <div className="col-span-7 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Importe en Palabras
                </span>
                <p className="text-xs font-bold text-slate-900 mt-0.5 italic">
                  {literal}
                </p>
              </div>

              {pago.notas && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Observaciones / Notas
                  </span>
                  <p className="text-xs text-slate-700 italic">
                    "{pago.notas}"
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Saldo Capital Restante:</span>
                  <p className="font-bold font-mono text-slate-900">{simbolo} {pago.saldoRestantePrestamo?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <span className="text-slate-500">Estado del Crédito:</span>
                  <p className="font-bold text-emerald-700">{pago.estadoPrestamo}</p>
                </div>
              </div>
            </div>

            <div className="col-span-5 bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 space-y-1.5">
              <div className="flex justify-between text-xs py-0.5">
                <span className="text-slate-600">Subtotal Neto:</span>
                <span className="font-mono font-semibold text-slate-800">{simbolo} {pago.montoPagado?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs py-0.5">
                <span className="text-slate-600">Descuento:</span>
                <span className="font-mono text-slate-500">{simbolo} 0.00</span>
              </div>
              <div className="flex justify-between text-sm py-1 border-t-2 border-indigo-900/40 font-bold">
                <span className="text-slate-900 uppercase">TOTAL PAGADO:</span>
                <span className="font-mono font-black text-indigo-900 text-base">{simbolo} {pago.montoPagado?.toFixed(2)}</span>
              </div>
              {conf.mostrarCreditoFiscal && (
                <div className="flex justify-between text-[10px] py-0.5 border-t border-indigo-200 text-indigo-900">
                  <span>Importe Base Crédito Fiscal:</span>
                  <span className="font-mono font-semibold">{simbolo} {pago.montoPagado?.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pie del Documento & Validación */}
          <div className="grid grid-cols-12 gap-4 pt-4 mt-6 border-t-2 border-slate-800 items-center">
            {conf.mostrarQr ? (
              <div className="col-span-3 flex flex-col items-center justify-center p-2 border border-slate-200 rounded-lg bg-slate-50 text-center">
                <svg className="w-20 h-20" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="0" y="0" width="30" height="30" fill="black"/>
                  <rect x="5" y="5" width="20" height="20" fill="white"/>
                  <rect x="10" y="10" width="10" height="10" fill="black"/>
                  <rect x="70" y="0" width="30" height="30" fill="black"/>
                  <rect x="75" y="5" width="20" height="20" fill="white"/>
                  <rect x="80" y="10" width="10" height="10" fill="black"/>
                  <rect x="0" y="70" width="30" height="30" fill="black"/>
                  <rect x="5" y="75" width="20" height="20" fill="white"/>
                  <rect x="10" y="80" width="10" height="10" fill="black"/>
                  <rect x="35" y="10" width="15" height="15" fill="black"/>
                  <rect x="55" y="10" width="10" height="25" fill="black"/>
                  <rect x="35" y="35" width="30" height="15" fill="black"/>
                  <rect x="10" y="40" width="15" height="15" fill="black"/>
                  <rect x="75" y="40" width="15" height="20" fill="black"/>
                  <rect x="35" y="65" width="15" height="15" fill="black"/>
                  <rect x="60" y="70" width="20" height="15" fill="black"/>
                </svg>
                <span className="text-[8px] font-mono text-slate-500 mt-1">{cuf}</span>
              </div>
            ) : (
              <div className="col-span-3 flex items-center justify-center p-3 border border-dashed border-slate-300 rounded-lg text-slate-400 text-[10px]">
                Constancia de Cobranza
              </div>
            )}

            <div className="col-span-9 space-y-1.5 pl-2 text-slate-700">
              <p className="text-xs font-semibold uppercase text-slate-900">
                "{conf.pieComprobante || 'Documento emitido como constancia formal de pago y amortización de cuota de préstamo privado.'}"
              </p>
              <p className="text-[10px] text-slate-500">
                {conf.subtituloComprobante || 'Constancia de pago'} emitida para {pago.clienteNombre} ({pago.clienteDni}).
              </p>
              <div className="flex justify-between items-center pt-2 text-[9px] text-slate-400">
                <span>Identificador: {pago.prestamoCodigo} / Recibo #{pago.nroRecibo}</span>
                <span>Firma / Sello del Emisor: _________________________</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* FORMATO 2: TICKET TÉRMICO 80mm                                      */}
      {/* ==================================================================== */}
      {formato === 'ticket' && (
        <div className="ticket-80mm bg-white text-slate-900 p-5 max-w-[76mm] mx-auto shadow-2xl rounded-sm font-sans text-[11px] leading-tight border border-slate-300">
          {/* Cabecera Emisor */}
          <div className="text-center pb-2 border-b-2 border-slate-900 space-y-1">
            <h2 className="text-sm font-black tracking-tight text-slate-950 uppercase">
              {conf.nombreEmisor}
            </h2>
            <p className="text-[10px] font-semibold text-slate-700">{conf.direccion}</p>
            <p className="text-[9px] text-slate-600">{conf.ciudadPais} • Tel: {conf.telefono}</p>
            <div className="pt-1">
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white uppercase">
                {conf.tipoComprobante || 'RECIBO DE PAGO'}
              </span>
            </div>
          </div>

          {/* Datos del Comprobante */}
          <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span className="font-bold text-slate-700">{conf.etiquetaDocumento || 'DNI/NIT'}:</span>
              <span className="font-mono font-bold">{conf.documentoIdentidad}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-slate-700">COMPROBANTE N°:</span>
              <span className="font-mono font-bold text-indigo-900">{pago.nroRecibo}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-slate-700">CÓD. CONTROL:</span>
              <span className="font-mono text-[9px]">{cuf.slice(0, 14)}</span>
            </div>
          </div>

          {/* Datos del Prestatario */}
          <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">FECHA / HORA:</span>
              <span>{fechaEmision.toLocaleDateString()} {fechaEmision.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div>
              <span className="text-slate-600 font-semibold">CLIENTE:</span>
              <p className="font-bold text-slate-900 uppercase">{pago.clienteNombre}</p>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">DOCUMENTO:</span>
              <span className="font-mono font-bold">{pago.clienteDni}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">CÓD. CRÉDITO:</span>
              <span className="font-mono font-bold">{pago.prestamoCodigo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">CUOTA COBRADA:</span>
              <span className="font-bold">CUOTA #{pago.nroCuota}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">FORMA DE PAGO:</span>
              <span className="font-semibold text-indigo-900">{pago.metodoPago}</span>
            </div>
          </div>

          {/* Detalle de Conceptos */}
          <div className="py-2 border-b border-slate-800 text-[10px]">
            <div className="flex justify-between font-bold text-slate-700 border-b border-slate-300 pb-1 mb-1">
              <span>CONCEPTO</span>
              <span>SUBTOTAL</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Amortización Capital #{pago.nroCuota}:</span>
              <span className="font-mono font-medium">{simbolo} {pago.capitalAmortizado?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Interés Periodo #{pago.nroCuota}:</span>
              <span className="font-mono font-medium">{simbolo} {pago.interesPagado?.toFixed(2)}</span>
            </div>
          </div>

          {/* Total Liquidado */}
          <div className="py-2 border-b-2 border-slate-900 space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="font-black text-xs uppercase">TOTAL A PAGAR:</span>
              <span className="font-mono font-black text-sm text-slate-950">
                {simbolo} {pago.montoPagado?.toFixed(2)}
              </span>
            </div>
            {conf.mostrarCreditoFiscal && (
              <div className="flex justify-between text-[9px] text-slate-600">
                <span>Importe Base Crédito Fiscal:</span>
                <span className="font-mono">{simbolo} {pago.montoPagado?.toFixed(2)}</span>
              </div>
            )}
            <p className="text-[9px] text-slate-700 font-semibold pt-1 italic">
              {literal}
            </p>
          </div>

          {/* Estado de Cartera */}
          <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
            <div className="flex justify-between">
              <span className="text-slate-600">Saldo Deudor Restante:</span>
              <span className="font-mono font-bold text-slate-900">{simbolo} {pago.saldoRestantePrestamo?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Estado del Crédito:</span>
              <span className="font-bold text-emerald-800">{pago.estadoPrestamo}</span>
            </div>
            {pago.notas && (
              <p className="text-[9px] text-slate-500">Nota: {pago.notas}</p>
            )}
          </div>

          {/* Código QR si está activo */}
          {conf.mostrarQr && (
            <div className="py-3 text-center flex flex-col items-center">
              <div className="p-1.5 border border-slate-800 rounded bg-white inline-block mb-1">
                <svg className="w-20 h-20" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="0" y="0" width="30" height="30" fill="black"/>
                  <rect x="5" y="5" width="20" height="20" fill="white"/>
                  <rect x="10" y="10" width="10" height="10" fill="black"/>
                  <rect x="70" y="0" width="30" height="30" fill="black"/>
                  <rect x="75" y="5" width="20" height="20" fill="white"/>
                  <rect x="80" y="10" width="10" height="10" fill="black"/>
                  <rect x="0" y="70" width="30" height="30" fill="black"/>
                  <rect x="5" y="75" width="20" height="20" fill="white"/>
                  <rect x="10" y="80" width="10" height="10" fill="black"/>
                  <rect x="35" y="10" width="15" height="15" fill="black"/>
                  <rect x="55" y="10" width="10" height="25" fill="black"/>
                  <rect x="35" y="35" width="30" height="15" fill="black"/>
                  <rect x="10" y="40" width="15" height="15" fill="black"/>
                  <rect x="75" y="40" width="15" height="20" fill="black"/>
                  <rect x="35" y="65" width="15" height="15" fill="black"/>
                  <rect x="60" y="70" width="20" height="15" fill="black"/>
                </svg>
              </div>
              <p className="font-mono text-[8px] text-slate-500 break-all">{cuf.slice(0, 24)}...</p>
            </div>
          )}

          {/* Leyenda y Pie Personalizados */}
          <div className="text-center text-[8px] text-slate-600 space-y-1">
            <p className="font-bold uppercase leading-tight">
              "{conf.pieComprobante || 'Documento de constancia formal de pago particular.'}"
            </p>
            <div className="pt-2 text-slate-400">
              Gracias por su cumplimiento y puntualidad.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
