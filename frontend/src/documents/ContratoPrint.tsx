import React from 'react';
import { Printer, ArrowLeft, ShieldCheck, Scale, FileText } from 'lucide-react';
import { Prestamo } from '../types';

interface ContratoPrintProps {
  prestamo: Prestamo;
  onVolver: () => void;
}

// Convertidor de número a letras en español
function numeroALetras(cantidad: number, nombreMoneda: string): string {
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas10a19 = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  function convertirGrupo(n: number): string {
    let salida = '';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (n === 100) return 'CIEN ';
    if (c > 0) salida += centenas[c] + ' ';

    const resto = n % 100;
    if (resto >= 10 && resto <= 19) {
      salida += decenas10a19[resto - 10] + ' ';
    } else if (resto >= 21 && resto <= 29) {
      salida += 'VEINTI' + unidades[u] + ' ';
    } else {
      if (d > 0) salida += decenas[d] + (u > 0 ? ' Y ' : ' ');
      if (u > 0) salida += unidades[u] + ' ';
    }
    return salida;
  }

  const entero = Math.floor(cantidad);
  let resultado = '';

  if (entero === 0) {
    resultado = 'CERO ';
  } else if (entero < 1000) {
    resultado = convertirGrupo(entero);
  } else if (entero < 1000000) {
    const miles = Math.floor(entero / 1000);
    const resto = entero % 1000;
    resultado = (miles === 1 ? 'UN MIL ' : convertirGrupo(miles) + 'MIL ') + convertirGrupo(resto);
  } else {
    resultado = entero.toString() + ' ';
  }

  return resultado.trim() + ' ' + nombreMoneda;
}

function formatearFechaEspanol(fechaStr: string): string {
  try {
    const [year, month, day] = fechaStr.split('-');
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const m = meses[parseInt(month, 10) - 1];
    return `${day} DE ${m.toUpperCase()} DE ${year}`;
  } catch {
    return fechaStr;
  }
}

export const ContratoPrint: React.FC<ContratoPrintProps> = ({ prestamo, onVolver }) => {
  const handlePrint = () => {
    window.print();
  };

  const simbolo = prestamo.moneda === 'BOB' ? 'Bs.' : '€';
  const nombreMoneda = prestamo.moneda === 'BOB' ? 'BOLIVIANOS' : 'EUROS';
  const montoEnLetras = numeroALetras(prestamo.montoSolicitado, nombreMoneda);
  const fechaFormateada = formatearFechaEspanol(prestamo.fechaInicio);
  const ciudad = prestamo.ciudad || (prestamo.moneda === 'EUR' ? 'Barcelona' : 'Cochabamba');
  const pais = prestamo.pais || (prestamo.moneda === 'EUR' ? 'España' : 'Bolivia');
  const esBolivia = (pais.toLowerCase().includes('bolivia') || prestamo.moneda === 'BOB') && !pais.toLowerCase().includes('españa');
  const labelDoc = esBolivia ? 'C.I.' : 'DNI';

  return (
    <div className="min-h-screen bg-slate-900 py-6 px-4">
      {/* Botones Flotantes (Ocultos en impresión) */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center no-print bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl">
        <button
          onClick={onVolver}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Regresar a la Aplicación
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300">
            Formato Estándar Legal A4 / Contrato entre Particulares con Plan de Pagos
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Imprimir Contrato
          </button>
        </div>
      </div>

      {/* Hoja de Impresión A4 */}
      <div className="contrato-a4 bg-white text-black p-10 max-w-4xl mx-auto shadow-2xl rounded-sm font-serif text-[12px] leading-relaxed border border-gray-200">
        
        {/* Cabecera Principal */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <h1 className="text-xl font-bold tracking-wider text-slate-900 uppercase">
            CONTRATO DE PRÉSTAMO ENTRE PARTICULARES
          </h1>
          <p className="text-sm font-semibold text-slate-800 mt-1 uppercase tracking-wide">
            {ciudad.toUpperCase()} ({pais.toUpperCase()}), A {fechaFormateada}
          </p>
          <p className="text-[11px] text-gray-500 font-sans mt-0.5">
            CÓDIGO DE OPERACIÓN: <strong>{prestamo.codigo}</strong>
          </p>
        </div>

        {/* Comparecencia / Reunidos */}
        <div className="space-y-3 text-justify">
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-gray-300 pb-1">
            REUNIDOS
          </h2>

          <p>
            <strong>DE UNA PARTE, EN CONCEPTO DE PRESTAMISTA:</strong>
            <br />
            <strong>NOEMI CONDORI BALCAS</strong>, mayor de edad, con {labelDoc}: <strong>30378592P</strong>, con domicilio a efectos de notificaciones en <strong>C. TEODORA LAMADRID 37 3 4 BARCELONA</strong>.
          </p>

          <p>
            <strong>DE OTRA PARTE, EN CONCEPTO DE PRESTATARIA / PRESTATARIO:</strong>
            <br />
            <strong>{prestamo.cliente.nombreCompleto}</strong>, mayor de edad, con {labelDoc}: <strong>{prestamo.cliente.dni}</strong>, con domicilio en <em>{prestamo.cliente.direccion || 'C. DE FRANCESC MORAGAS 91 P01 1 SANTA COLOMA DE GRAMANET BARCELONA'}</em>.
            {prestamo.garanteNombre && (
              <>
                <br />
                <strong>Y EN CALIDAD DE FIADOR / GARANTE SOLIDARIO:</strong> <strong>{prestamo.garanteNombre}</strong>, mayor de edad, con {labelDoc}: <strong>{prestamo.garanteDni || 'S/N'}</strong>, quien se constituye en obligado solidario y mancomunado.
              </>
            )}
          </p>

          <p className="font-semibold bg-gray-50 p-2 border-l-4 border-slate-700 italic text-[11.5px]">
            AMBAS PARTES SE RECONOCEN MUTUA Y RECÍPROCAMENTE LA CAPACIDAD LEGAL NECESARIA PARA OTORGAR EL PRESENTE CONTRATO DE PRÉSTAMO, CON UN INTERÉS DE {prestamo.tasaInteresMensual}% MENSUAL, AL TENOR DE LAS SIGUIENTES:
          </p>

          <h2 className="font-bold text-xs uppercase tracking-wider text-center text-slate-900 pt-2 pb-1">
            CLÁUSULAS
          </h2>

          <p>
            <strong>PRIMERA.- OBJETO Y ENTREGA DEL CAPITAL:</strong>
            <br />
            La PRESTAMISTA entrega en calidad de préstamo a la PRESTATARIA la suma de <strong>{montoEnLetras} ({simbolo} {prestamo.montoSolicitado.toLocaleString(undefined, { minimumFractionDigits: 2 })})</strong>. Dicha cantidad es entregada en efectivo / transferencia bancaria a entera satisfacción de la PRESTATARIA, quien la recibe en este acto, sirviendo el presente documento de la más solemne y formal carta de pago y recibo.
          </p>

          <p>
            <strong>SEGUNDA.- INTERESES REMUNERATORIOS:</strong>
            <br />
            El préstamo devengará un interés pactado de común acuerdo del <strong>{prestamo.tasaInteresMensual}% mensual</strong> sobre el saldo deudor del capital pendiente durante toda la vigencia del crédito.
          </p>

          <p>
            <strong>TERCERA.- PLAZO DE VIGENCIA Y FORMA DE DEVOLUCIÓN:</strong>
            <br />
            La PRESTATARIA se obliga a devolver la cantidad prestada en un plazo de <strong>{prestamo.plazoMeses} meses</strong>, computables a partir de la firma del presente contrato. La devolución se efectuará en cuotas mensuales sucesivas conforme al <em>ANEXO: CUADRO DE AMORTIZACIÓN Y PLAN DE PAGOS</em>, el cual forma parte indivisible del presente contrato, rigiéndose bajo el sistema <strong>{prestamo.tipoSistema}</strong>.
          </p>

          <p>
            <strong>CUARTA.- AMORTIZACIÓN ANTICIPADA:</strong>
            <br />
            La PRESTATARIA podrá amortizar anticipadamente la totalidad o parte del capital pendiente en cualquier momento antes de su vencimiento, sin que ello devengue comisión ni penalización alguna por reembolso anticipado, recalculándose los intereses sobre el saldo deudor efectivamente adeudado.
          </p>

          <p>
            <strong>QUINTA.- INCUMPLIMIENTO Y VENCIMIENTO ANTICIPADO:</strong>
            <br />
            La falta de pago a su vencimiento de cualquiera de las cuotas pactadas facultará a la PRESTAMISTA a dar por vencido anticipadamente el préstamo en su totalidad y exigir de inmediato por vía judicial o extrajudicial el pago íntegro del capital pendiente, más los intereses de demora e indemnizatorios generados de pleno derecho.
          </p>

          <p>
            <strong>SEXTA.- RESPONSABILIDAD PATRIMONIAL Y FUERO JUDICIAL:</strong>
            <br />
            La PRESTATARIA responde del cumplimiento de todas las obligaciones pecuniarias con todos sus bienes presentes y futuros, conforme al régimen legal de responsabilidad patrimonial universal. Para cuantas cuestiones, divergencias o litigios pudieran suscitarse con motivo del presente contrato, ambas partes se someten de manera expresa e irrevocable a los Juzgados y Tribunales de la ciudad de <strong>{ciudad.toUpperCase()} ({pais.toUpperCase()})</strong>, con renuncia a cualquier otro fuero que pudiera corresponderles.
          </p>

          <p className="text-center font-bold pt-3 pb-1">
            EN PRUEBA DE CONFORMIDAD FIRMAN ESTE DOCUMENTO POR DUPLICADO Y A UN SOLO EFECTO EN {ciudad.toUpperCase()} ({pais.toUpperCase()}) EN LA FECHA INDICADA.
          </p>
        </div>

        {/* Bloque de Firmas */}
        <div className="mt-12 pt-6 grid grid-cols-2 gap-10 text-center text-xs">
          <div className="border-t-2 border-black pt-3">
            <p className="font-bold text-sm tracking-wide">NOEMI CONDORI BALCAS</p>
            <p className="text-gray-700 font-sans text-[11px]">{labelDoc}: 30378592P</p>
            <p className="text-gray-500 font-semibold uppercase text-[10px] mt-0.5">Prestamista</p>
          </div>

          <div className="border-t-2 border-black pt-3">
            <p className="font-bold text-sm tracking-wide">{prestamo.cliente.nombreCompleto}</p>
            <p className="text-gray-700 font-sans text-[11px]">{labelDoc}: {prestamo.cliente.dni}</p>
            <p className="text-gray-500 font-semibold uppercase text-[10px] mt-0.5">Prestataria / Prestatario</p>
          </div>
        </div>

        {prestamo.garanteNombre && (
          <div className="mt-8 pt-4 max-w-xs mx-auto border-t border-black text-center text-xs">
            <p className="font-bold text-sm">{prestamo.garanteNombre}</p>
            <p className="text-gray-700 font-sans text-[11px]">{labelDoc}: {prestamo.garanteDni || 'S/N'}</p>
            <p className="text-gray-500 font-semibold uppercase text-[10px]">Fiador / Garante Solidario</p>
          </div>
        )}

        {/* Tabla Anexa del Cronograma */}
        <div className="mt-12 pt-6 border-t-2 border-slate-900 page-break-before">
          <h2 className="text-sm font-bold uppercase mb-2 text-center tracking-wider text-slate-900">
            ANEXO: CALENDARIO DE AMORTIZACIÓN Y PLAN DE PAGOS
          </h2>
          <table className="w-full text-[10.5px] border-collapse border border-gray-400 text-center font-sans">
            <thead>
              <tr className="bg-slate-800 text-white font-bold border-b border-gray-400">
                <th className="border border-gray-400 p-1.5">Nº Cuota</th>
                <th className="border border-gray-400 p-1.5">Vencimiento</th>
                <th className="border border-gray-400 p-1.5 text-right">Cuota Total ({simbolo})</th>
                <th className="border border-gray-400 p-1.5 text-right">Amort. Capital ({simbolo})</th>
                <th className="border border-gray-400 p-1.5 text-right">Interés ({simbolo})</th>
                <th className="border border-gray-400 p-1.5 text-right">Saldo Restante ({simbolo})</th>
              </tr>
            </thead>
            <tbody>
              {prestamo.cuotas && prestamo.cuotas.map((c) => (
                <tr key={c.nroCuota} className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="border border-gray-400 p-1.5 font-bold">{c.nroCuota}</td>
                  <td className="border border-gray-400 p-1.5">{c.fechaVencimiento}</td>
                  <td className="border border-gray-400 p-1.5 text-right font-bold text-slate-900">
                    {c.cuotaTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border border-gray-400 p-1.5 text-right text-emerald-800 font-semibold">
                    {c.capitalAmortizado.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border border-gray-400 p-1.5 text-right text-indigo-800">
                    {c.interes.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border border-gray-400 p-1.5 text-right text-gray-700">
                    {c.saldoRestante.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
