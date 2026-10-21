package com.prestamos.services;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.prestamos.entities.Cliente;
import com.prestamos.entities.Cuota;
import com.prestamos.entities.Pago;
import com.prestamos.entities.Prestamo;
import com.prestamos.repositories.ClienteRepository;
import com.prestamos.repositories.CuotaRepository;
import com.prestamos.repositories.PagoRepository;
import com.prestamos.repositories.PrestamoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.awt.Desktop;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
public class ExpedienteDigitalService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private PrestamoRepository prestamoRepository;

    @Autowired
    private ConfiguracionService configuracionService;

    @Autowired
    private CuotaRepository cuotaRepository;

    @Autowired
    private PagoRepository pagoRepository;

    // Colores corporativos
    private static final Color COLOR_PRIMARIO = new Color(15, 23, 42);      // Slate 900
    private static final Color COLOR_SECUNDARIO = new Color(79, 70, 229);   // Indigo 600
    private static final Color COLOR_FONDO_CLARO = new Color(241, 245, 249); // Slate 100
    private static final Color COLOR_BORDE = new Color(203, 213, 225);      // Slate 300
    private static final Color COLOR_EXITO = new Color(5, 150, 105);        // Emerald 600
    private static final Color COLOR_ALERTA = new Color(217, 119, 6);       // Amber 600

    public File getDirectorioRaizEscritorio() {
        String userHome = System.getProperty("user.home");
        File oneDriveDesktop = new File(userHome, "OneDrive" + File.separator + "Desktop");
        File baseDesktop = (oneDriveDesktop.exists() && oneDriveDesktop.isDirectory())
                ? oneDriveDesktop
                : new File(userHome, "Desktop");

        File carpetaPrincipal = new File(baseDesktop, "Expedientes_Clientes");
        if (!carpetaPrincipal.exists()) {
            carpetaPrincipal.mkdirs();
        }
        return carpetaPrincipal;
    }

    public File getCarpetaCliente(Cliente cliente) {
        File raiz = getDirectorioRaizEscritorio();
        String nombreLimpio = cliente.getNombreCompleto().replaceAll("[\\/:*?\"<>|]", "").trim();
        String carpetaNombre = nombreLimpio + " - " + cliente.getDni().trim();
        File carpetaCliente = new File(raiz, carpetaNombre);
        if (!carpetaCliente.exists()) {
            carpetaCliente.mkdirs();
        }
        return carpetaCliente;
    }

    // Guarda el contrato legal en formato PDF y actualiza el estado de cuenta
    public void guardarContratoYFicha(Prestamo prestamo) {
        try {
            Cliente cliente = prestamo.getCliente();
            File carpetaCliente = getCarpetaCliente(cliente);

            // 1. Guardar Contrato en PDF
            File archivoContrato = new File(carpetaCliente, "Contrato_" + prestamo.getCodigo() + ".pdf");
            generarPdfContrato(prestamo, archivoContrato);

            // 2. Guardar Estado de Cuenta del Préstamo en PDF
            File archivoEstado = new File(carpetaCliente, "Estado_Cuenta_" + prestamo.getCodigo() + ".pdf");
            generarPdfEstadoCuenta(prestamo, archivoEstado);

            // Limpiar archivos HTML obsoletos si existían
            limpiarHtmlObsoleto(carpetaCliente);

            System.out.println("Expediente PDF actualizado en Escritorio: " + archivoContrato.getAbsolutePath());
        } catch (Exception e) {
            System.err.println("Error guardando expediente PDF en Escritorio: " + e.getMessage());
        }
    }

    // Guarda la Factura formal en formato PDF en la subcarpeta del cliente
    public void guardarFacturaPago(Pago pago, Prestamo prestamo, Cuota cuota, BigDecimal nuevoSaldo) {
        try {
            Cliente cliente = prestamo.getCliente();
            File carpetaCliente = getCarpetaCliente(cliente);

            File carpetaFacturas = new File(carpetaCliente, "Comprobantes_y_Facturas");
            if (!carpetaFacturas.exists()) {
                carpetaFacturas.mkdirs();
            }

            // 1. Guardar archivo Factura en PDF
            File archivoFactura = new File(carpetaFacturas, "Factura_" + pago.getNroRecibo() + "_Cuota_" + cuota.getNroCuota() + ".pdf");
            generarPdfFactura(pago, prestamo, cuota, nuevoSaldo, archivoFactura);

            // 2. Actualizar Estado de Cuenta del Préstamo en PDF
            File archivoEstado = new File(carpetaCliente, "Estado_Cuenta_" + prestamo.getCodigo() + ".pdf");
            generarPdfEstadoCuenta(prestamo, archivoEstado);

            // Limpiar archivos HTML obsoletos si existían
            limpiarHtmlObsoleto(carpetaCliente);
            limpiarHtmlObsoleto(carpetaFacturas);

            System.out.println("Factura PDF guardada en Escritorio: " + archivoFactura.getAbsolutePath());
        } catch (Exception e) {
            System.err.println("Error guardando factura PDF en Escritorio: " + e.getMessage());
        }
    }

    public void sincronizarTodo() {
        try {
            List<Prestamo> prestamos = prestamoRepository.findAll();
            for (Prestamo p : prestamos) {
                guardarContratoYFicha(p);
            }

            List<Pago> pagos = pagoRepository.findAll();
            for (Pago pg : pagos) {
                Cuota cuota = pg.getCuota();
                Prestamo prestamo = cuota.getPrestamo();
                guardarFacturaPago(pg, prestamo, cuota, prestamo.getSaldoActual());
            }
            System.out.println("Sincronizacion completa de Expedientes PDF en Escritorio finalizada.");
        } catch (Exception e) {
            System.err.println("Error en sincronizacion PDF: " + e.getMessage());
        }
    }

    public boolean abrirCarpetaEnExplorador(String dni) {
        try {
            return clienteRepository.findByDni(dni)
                    .map(cliente -> abrirCarpetaNativa(getCarpetaCliente(cliente)))
                    .orElseGet(() -> {
                        File raiz = getDirectorioRaizEscritorio();
                        File[] carpetas = raiz.listFiles((dir, name) -> name.contains(dni.trim()));
                        if (carpetas != null && carpetas.length > 0) {
                            return abrirCarpetaNativa(carpetas[0]);
                        }
                        return abrirCarpetaNativa(raiz);
                    });
        } catch (Exception e) {
            System.err.println("Error en abrirCarpetaEnExplorador: " + e.getMessage());
            return false;
        }
    }

    public boolean abrirCarpetaRaiz() {
        try {
            File raiz = getDirectorioRaizEscritorio();
            return abrirCarpetaNativa(raiz);
        } catch (Exception e) {
            System.err.println("Error abriendo carpeta raiz: " + e.getMessage());
            return false;
        }
    }

    public boolean abrirCarpetaNativa(File carpeta) {
        if (carpeta == null) return false;
        try {
            if (!carpeta.exists()) {
                carpeta.mkdirs();
            }

            // 1. Intentar con Desktop API de Java (ShellExecute oficial en Windows / macOS)
            try {
                if (Desktop.isDesktopSupported()) {
                    Desktop desktop = Desktop.getDesktop();
                    if (desktop.isSupported(Desktop.Action.OPEN)) {
                        desktop.open(carpeta);
                        System.out.println("Carpeta abierta mediante Desktop API: " + carpeta.getAbsolutePath());
                        return true;
                    }
                }
            } catch (Throwable t) {
                System.err.println("Desktop.open aviso (usando fallback de shell): " + t.getMessage());
            }

            // 2. Fallback de comandos de consola del sistema operativo
            String os = System.getProperty("os.name", "").toLowerCase();
            if (os.contains("win")) {
                // En Windows, start "" "ruta" invoca el Shell del Explorador y lo trae al primer plano
                Process p = new ProcessBuilder("cmd.exe", "/c", "start", "", carpeta.getAbsolutePath()).start();
                System.out.println("Carpeta abierta mediante cmd start: " + carpeta.getAbsolutePath() + " (alive: " + p.isAlive() + ")");
                return true;
            } else if (os.contains("mac")) {
                new ProcessBuilder("open", carpeta.getAbsolutePath()).start();
                return true;
            } else {
                new ProcessBuilder("xdg-open", carpeta.getAbsolutePath()).start();
                return true;
            }
        } catch (Exception e) {
            System.err.println("Error abriendo carpeta nativa: " + e.getMessage());
            return false;
        }
    }

    private void limpiarHtmlObsoleto(File carpeta) {
        File[] archivos = carpeta.listFiles((dir, name) -> name.toLowerCase().endsWith(".html"));
        if (archivos != null) {
            for (File f : archivos) {
                f.delete();
            }
        }
    }

    // =========================================================================
    // 1. GENERADOR DE FACTURA OFICIAL EN PDF (A4)
    // =========================================================================
    private void generarPdfFactura(Pago pago, Prestamo prestamo, Cuota cuota, BigDecimal nuevoSaldo, File destino) throws Exception {
        Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(doc, new FileOutputStream(destino));
        doc.open();

        Font fEmpresa = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, COLOR_PRIMARIO);
        Font fSubEmpresa = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, COLOR_SECUNDARIO);
        Font fTextoChico = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.DARK_GRAY);
        Font fTitFiscal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, COLOR_PRIMARIO);
        Font fFiscal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, COLOR_PRIMARIO);
        Font fEtiqueta = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.GRAY);
        Font fValor = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);
        Font fTablaCab = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
        Font fTablaCelda = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);
        Font fTotal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, COLOR_PRIMARIO);

        String simbolo = prestamo.getMoneda().name().equals("BOB") ? "Bs." : "EUR";
        String fecha = pago.getFechaPago().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));

        com.prestamos.entities.ConfiguracionEmpresa conf = configuracionService.obtenerConfiguracion();

        // Cabecera: Empresa (Izq) y Cuadro Fiscal (Der)
        PdfPTable tHeader = new PdfPTable(2);
        tHeader.setWidthPercentage(100);
        tHeader.setWidths(new float[]{58, 42});

        PdfPCell cIzq = new PdfPCell();
        cIzq.setBorder(Rectangle.NO_BORDER);
        cIzq.addElement(new Paragraph(conf.getNombreEmisor(), fEmpresa));
        if (conf.getActividad() != null && !conf.getActividad().isBlank()) {
            cIzq.addElement(new Paragraph(conf.getActividad(), fSubEmpresa));
        }
        if (conf.getDireccion() != null && !conf.getDireccion().isBlank()) {
            cIzq.addElement(new Paragraph(conf.getDireccion(), fTextoChico));
        }
        if (conf.getTelefono() != null && !conf.getTelefono().isBlank()) {
            cIzq.addElement(new Paragraph("Contacto: " + conf.getTelefono(), fTextoChico));
        }
        tHeader.addCell(cIzq);

        PdfPCell cDer = new PdfPCell();
        cDer.setBorder(Rectangle.BOX);
        cDer.setBorderColor(COLOR_SECUNDARIO);
        cDer.setBorderWidth(1.5f);
        cDer.setBackgroundColor(new Color(238, 242, 255));
        cDer.setPadding(8);
        cDer.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph pF1 = new Paragraph(conf.getTipoComprobante().toUpperCase(), fTitFiscal);
        pF1.setAlignment(Element.ALIGN_CENTER);
        cDer.addElement(pF1);

        if (conf.getSubtituloComprobante() != null && !conf.getSubtituloComprobante().isBlank()) {
            Paragraph pF2 = new Paragraph("(" + conf.getSubtituloComprobante() + ")", fTextoChico);
            pF2.setAlignment(Element.ALIGN_CENTER);
            cDer.addElement(pF2);
        } else if (Boolean.TRUE.equals(conf.getMostrarCreditoFiscal())) {
            Paragraph pF2 = new Paragraph("(Con Derecho a Credito Fiscal)", fTextoChico);
            pF2.setAlignment(Element.ALIGN_CENTER);
            cDer.addElement(pF2);
        }

        String docEtiqueta = (conf.getEtiquetaDocumento() != null && !conf.getEtiquetaDocumento().isBlank())
                ? conf.getEtiquetaDocumento()
                : "DOC";
        String docNumero = (conf.getDocumentoIdentidad() != null && !conf.getDocumentoIdentidad().isBlank())
                ? conf.getDocumentoIdentidad()
                : "30378592P";

        Paragraph pF3 = new Paragraph(docEtiqueta + ": " + docNumero + "\nNRO: " + pago.getNroRecibo() + "\nFECHA: " + fecha, fFiscal);
        pF3.setAlignment(Element.ALIGN_CENTER);
        cDer.addElement(pF3);
        tHeader.addCell(cDer);

        doc.add(tHeader);
        doc.add(new Paragraph(" "));

        // Datos del Prestatario y de la Operación
        PdfPTable tCliente = new PdfPTable(2);
        tCliente.setWidthPercentage(100);
        tCliente.setWidths(new float[]{55, 45});

        PdfPCell cCl1 = new PdfPCell();
        cCl1.setBackgroundColor(COLOR_FONDO_CLARO);
        cCl1.setBorderColor(COLOR_BORDE);
        cCl1.setPadding(8);
        cCl1.addElement(new Paragraph("DATOS DEL PRESTATARIO", fEtiqueta));
        cCl1.addElement(new Paragraph(prestamo.getCliente().getNombreCompleto(), fValor));
        cCl1.addElement(new Paragraph("NIT / C.I.: " + prestamo.getCliente().getDni(), fTextoChico));
        cCl1.addElement(new Paragraph("Forma de Pago: " + pago.getMetodoPago(), fTextoChico));
        tCliente.addCell(cCl1);

        PdfPCell cCl2 = new PdfPCell();
        cCl2.setBackgroundColor(COLOR_FONDO_CLARO);
        cCl2.setBorderColor(COLOR_BORDE);
        cCl2.setPadding(8);
        cCl2.addElement(new Paragraph("DATOS DE LA EMISION", fEtiqueta));
        cCl2.addElement(new Paragraph("Fecha y Hora: " + fecha, fTextoChico));
        cCl2.addElement(new Paragraph("Codigo Credito: " + prestamo.getCodigo(), fValor));
        cCl2.addElement(new Paragraph("Cuota Cancelada: Cuota N " + cuota.getNroCuota(), fTextoChico));
        tCliente.addCell(cCl2);

        doc.add(tCliente);
        doc.add(new Paragraph(" "));

        // Tabla de Detalle de Items
        PdfPTable tItems = new PdfPTable(5);
        tItems.setWidthPercentage(100);
        tItems.setWidths(new float[]{15, 45, 12, 14, 14});

        String[] headers = {"Codigo", "Concepto / Descripcion", "Cant.", "P. Unitario", "Subtotal (" + simbolo + ")"};
        for (String h : headers) {
            PdfPCell ch = new PdfPCell(new Phrase(h, fTablaCab));
            ch.setBackgroundColor(COLOR_PRIMARIO);
            ch.setPadding(6);
            ch.setHorizontalAlignment(Element.ALIGN_CENTER);
            tItems.addCell(ch);
        }

        // Fila 1: Amortización
        tItems.addCell(crearCeldaCentrada("FIN-CAP-01", fTablaCelda));
        tItems.addCell(crearCelda("Amortizacion a Capital (Cuota #" + cuota.getNroCuota() + " - Credito " + prestamo.getCodigo() + ")", fTablaCelda));
        tItems.addCell(crearCeldaCentrada("1.00", fTablaCelda));
        tItems.addCell(crearCeldaDerecha(simbolo + " " + String.format("%.2f", cuota.getCapitalAmortizado()), fTablaCelda));
        tItems.addCell(crearCeldaDerecha(simbolo + " " + String.format("%.2f", cuota.getCapitalAmortizado()), fTablaCelda));

        // Fila 2: Interés
        tItems.addCell(crearCeldaCentrada("FIN-INT-02", fTablaCelda));
        tItems.addCell(crearCelda("Interes Compensatorio del Periodo (Cuota #" + cuota.getNroCuota() + ")", fTablaCelda));
        tItems.addCell(crearCeldaCentrada("1.00", fTablaCelda));
        tItems.addCell(crearCeldaDerecha(simbolo + " " + String.format("%.2f", cuota.getInteres()), fTablaCelda));
        tItems.addCell(crearCeldaDerecha(simbolo + " " + String.format("%.2f", cuota.getInteres()), fTablaCelda));

        doc.add(tItems);
        doc.add(new Paragraph(" "));

        // Bloque de Totales y Saldo Restante
        PdfPTable tTotales = new PdfPTable(2);
        tTotales.setWidthPercentage(100);
        tTotales.setWidths(new float[]{60, 40});

        PdfPCell cTotIzq = new PdfPCell();
        cTotIzq.setBorder(Rectangle.BOX);
        cTotIzq.setBorderColor(COLOR_BORDE);
        cTotIzq.setPadding(8);
        cTotIzq.addElement(new Paragraph("ESTADO FINANCIERO POST-PAGO", fEtiqueta));
        cTotIzq.addElement(new Paragraph("Saldo Deudor Restante: " + simbolo + " " + String.format("%.2f", nuevoSaldo), fValor));
        cTotIzq.addElement(new Paragraph("Estado del Credito: " + prestamo.getEstado(), fTextoChico));
        if (pago.getNotas() != null && !pago.getNotas().isBlank()) {
            cTotIzq.addElement(new Paragraph("Observaciones: " + pago.getNotas(), fTextoChico));
        }
        tTotales.addCell(cTotIzq);

        PdfPCell cTotDer = new PdfPCell();
        cTotDer.setBackgroundColor(COLOR_FONDO_CLARO);
        cTotDer.setBorder(Rectangle.BOX);
        cTotDer.setBorderColor(COLOR_BORDE);
        cTotDer.setPadding(10);
        cTotDer.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph pTotTit = new Paragraph("TOTAL FACTURADO", fEtiqueta);
        pTotTit.setAlignment(Element.ALIGN_RIGHT);
        cTotDer.addElement(pTotTit);
        Paragraph pTotMonto = new Paragraph(simbolo + " " + String.format("%.2f", pago.getMontoPagado()), fTotal);
        pTotMonto.setAlignment(Element.ALIGN_RIGHT);
        cTotDer.addElement(pTotMonto);
        tTotales.addCell(cTotDer);

        doc.add(tTotales);
        doc.add(new Paragraph(" "));

        // Pie Personalizado
        String pieTexto = (conf.getPieComprobante() != null && !conf.getPieComprobante().isBlank())
                ? conf.getPieComprobante()
                : "Conserve este comprobante como constancia legal de pago. Gracias por su puntualidad.";
        Paragraph pPie = new Paragraph(pieTexto.toUpperCase(), fEtiqueta);
        pPie.setAlignment(Element.ALIGN_CENTER);
        doc.add(pPie);

        doc.close();
    }

    // =========================================================================
    // 2. GENERADOR DE CONTRATO LEGAL EN PDF (A4)
    // =========================================================================
    // =========================================================================
    // 2. GENERADOR DE CONTRATO LEGAL EN PDF (A4) - ENTRE PARTICULARES
    // =========================================================================
    private void generarPdfContrato(Prestamo prestamo, File destino) throws Exception {
        Document doc = new Document(PageSize.A4, 40, 40, 40, 40);
        PdfWriter.getInstance(doc, new FileOutputStream(destino));
        doc.open();

        Font fTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, COLOR_PRIMARIO);
        Font fSubtitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, COLOR_SECUNDARIO);
        Font fCuerpo = FontFactory.getFont(FontFactory.HELVETICA, 9.0f, Color.BLACK);
        Font fCuerpoBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9.0f, Color.BLACK);
        Font fTablaCab = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
        Font fTablaCelda = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, Color.BLACK);

        String simbolo = prestamo.getMoneda().name().equals("BOB") ? "Bs." : "EUR";
        String nombreMoneda = prestamo.getMoneda().name().equals("BOB") ? "BOLIVIANOS" : "EUROS";
        String fechaTexto = formatearFechaEspanol(prestamo.getFechaInicio());
        String montoLetras = convertirNumeroALetras(prestamo.getMontoSolicitado(), nombreMoneda);
        String ciudad = (prestamo.getCiudad() != null && !prestamo.getCiudad().isBlank())
                ? prestamo.getCiudad().trim()
                : (prestamo.getMoneda().name().equals("EUR") ? "Barcelona" : "Cochabamba");
        String pais = (prestamo.getPais() != null && !prestamo.getPais().isBlank())
                ? prestamo.getPais().trim()
                : (prestamo.getMoneda().name().equals("EUR") ? "España" : "Bolivia");
        boolean esBolivia = (pais.toLowerCase().contains("bolivia") || prestamo.getMoneda().name().equals("BOB")) && !pais.toLowerCase().contains("españa");
        String labelDoc = esBolivia ? "C.I." : "DNI";

        // Título Principal
        Paragraph pTit = new Paragraph("CONTRATO DE PRESTAMO ENTRE PARTICULARES", fTitulo);
        pTit.setAlignment(Element.ALIGN_CENTER);
        doc.add(pTit);

        Paragraph pCiudadFecha = new Paragraph(ciudad.toUpperCase() + " (" + pais.toUpperCase() + "), A " + fechaTexto.toUpperCase(), fSubtitulo);
        pCiudadFecha.setAlignment(Element.ALIGN_CENTER);
        doc.add(pCiudadFecha);

        Paragraph pCod = new Paragraph("CODIGO DE OPERACION: " + prestamo.getCodigo(), fTablaCelda);
        pCod.setAlignment(Element.ALIGN_CENTER);
        doc.add(pCod);
        doc.add(new Paragraph(" "));

        // Comparecientes / Reunidos
        Paragraph pReunidosTit = new Paragraph("REUNIDOS", fCuerpoBold);
        doc.add(pReunidosTit);

        Paragraph pPrestamista = new Paragraph();
        pPrestamista.add(new Chunk("DE UNA PARTE, EN CALIDAD DE PRESTAMISTA:\n", fCuerpoBold));
        pPrestamista.add(new Chunk("Dna. NOEMI CONDORI BALCAS, mayor de edad, con " + labelDoc + ": 30378592P, con domicilio a efectos de notificaciones en C. TEODORA LAMADRID 37, 3 4, BARCELONA.", fCuerpo));
        pPrestamista.setAlignment(Element.ALIGN_JUSTIFIED);
        doc.add(pPrestamista);
        doc.add(new Paragraph(" "));

        String dirCliente = (prestamo.getCliente().getDireccion() != null && !prestamo.getCliente().getDireccion().isBlank())
                ? prestamo.getCliente().getDireccion()
                : "C. DE FRANCESC MORAGAS 91 P01 1 SANTA COLOMA DE GRAMANET BARCELONA";

        Paragraph pPrestataria = new Paragraph();
        pPrestataria.add(new Chunk("DE OTRA PARTE, EN CALIDAD DE PRESTATARIA / PRESTATARIO:\n", fCuerpoBold));
        pPrestataria.add(new Chunk(prestamo.getCliente().getNombreCompleto().toUpperCase() + ", mayor de edad, con " + labelDoc + ": " + prestamo.getCliente().getDni() + ", con domicilio en " + dirCliente + ".", fCuerpo));
        if (prestamo.getGaranteNombre() != null && !prestamo.getGaranteNombre().isBlank()) {
            pPrestataria.add(new Chunk("\nY en concepto de GARANTE / FIADOR SOLIDARIO: " + prestamo.getGaranteNombre().toUpperCase() + ", con " + labelDoc + ": " + prestamo.getGaranteDni() + ".", fCuerpo));
        }
        pPrestataria.setAlignment(Element.ALIGN_JUSTIFIED);
        doc.add(pPrestataria);
        doc.add(new Paragraph(" "));

        Paragraph pCapacidad = new Paragraph("AMBAS PARTES SE RECONOCEN MUTUA Y RECIPROCAMENTE LA CAPACIDAD LEGAL NECESARIA PARA OTORGAR EL PRESENTE CONTRATO DE PRESTAMO, CON UN INTERES DE " + prestamo.getTasaInteresMensual() + "% MENSUAL, AL TENOR DE LAS SIGUIENTES:", fCuerpoBold);
        pCapacidad.setAlignment(Element.ALIGN_JUSTIFIED);
        doc.add(pCapacidad);
        doc.add(new Paragraph(" "));

        Paragraph pClausTit = new Paragraph("CLAUSULAS", fCuerpoBold);
        pClausTit.setAlignment(Element.ALIGN_CENTER);
        doc.add(pClausTit);
        doc.add(new Paragraph(" "));

        // CLAUSULA 1
        Paragraph pC1 = new Paragraph();
        pC1.add(new Chunk("PRIMERA.- OBJETO Y ENTREGA DEL CAPITAL:\n", fCuerpoBold));
        pC1.add(new Chunk("La PRESTAMISTA entrega en calidad de prestamo a la PRESTATARIA la cantidad de " + montoLetras + " (" + simbolo + " " + String.format("%.2f", prestamo.getMontoSolicitado()) + "), entregado en efectivo / transferencia a entera satisfaccion de la PRESTATARIA, quien lo recibe y acepta en este acto, sirviendo el presente documento como la mas formal y eficaz carta de pago y recibo de entrega.", fCuerpo));
        pC1.setAlignment(Element.ALIGN_JUSTIFIED);
        doc.add(pC1);
        doc.add(new Paragraph(" "));

        // CLAUSULA 2
        Paragraph pC2 = new Paragraph();
        pC2.add(new Chunk("SEGUNDA.- INTERESES REMUNERATORIOS:\n", fCuerpoBold));
        pC2.add(new Chunk("El prestamo devengara un interes pactado de " + prestamo.getTasaInteresMensual() + "% mensual sobre el saldo deudor pendiente de amortizacion durante la vigencia del credito.", fCuerpo));
        pC2.setAlignment(Element.ALIGN_JUSTIFIED);
        doc.add(pC2);
        doc.add(new Paragraph(" "));

        // CLAUSULA 3
        Paragraph pC3 = new Paragraph();
        pC3.add(new Chunk("TERCERA.- DEVOLUCION, PLAZO Y FORMA DE PAGO:\n", fCuerpoBold));
        pC3.add(new Chunk("La PRESTATARIA se obliga irrevocablemente a devolver la cantidad prestada en un plazo de " + prestamo.getPlazoMeses() + " meses, computables a partir de la firma del presente contrato. La amortizacion se realizara en cuotas mensuales sucesivas segun el sistema " + prestamo.getTipoSistema() + ", con vencimientos e importes detallados en el Cronograma de Pagos Anexo.", fCuerpo));
        pC3.setAlignment(Element.ALIGN_JUSTIFIED);
        doc.add(pC3);
        doc.add(new Paragraph(" "));

        // CLAUSULA 4
        Paragraph pC4 = new Paragraph();
        pC4.add(new Chunk("CUARTA.- AMORTIZACION ANTICIPADA:\n", fCuerpoBold));
        pC4.add(new Chunk("La PRESTATARIA tendra la facultad de realizar amortizaciones anticipadas totales o parciales del capital adeudado en cualquier momento, sin penalizacion ni comision de cancelacion, recalculandose los intereses sobre el saldo deudor remanente.", fCuerpo));
        pC4.setAlignment(Element.ALIGN_JUSTIFIED);
        doc.add(pC4);
        doc.add(new Paragraph(" "));

        // CLAUSULA 5
        Paragraph pC5 = new Paragraph();
        pC5.add(new Chunk("QUINTA.- INCUMPLIMIENTO Y VENCIMIENTO ANTICIPADO:\n", fCuerpoBold));
        pC5.add(new Chunk("La falta de pago de cualquier cuota a su vencimiento facultara a la PRESTAMISTA a dar por vencido anticipadamente el prestamo y reclamar judicial o extrajudicialmente el importe total debido mas costas e intereses de demora correspondientes.", fCuerpo));
        pC5.setAlignment(Element.ALIGN_JUSTIFIED);
        doc.add(pC5);
        doc.add(new Paragraph(" "));

        // CLAUSULA 6
        Paragraph pC6 = new Paragraph();
        pC6.add(new Chunk("SEXTA.- RESPONSABILIDAD PATRIMONIAL Y FUERO:\n", fCuerpoBold));
        pC6.add(new Chunk("La PRESTATARIA responde del cumplimiento de sus obligaciones con todos sus bienes presentes y futuros. Para cualquier controversia, las partes se someten expresamente a la jurisdiccion de los Juzgados y Tribunales de la ciudad de " + ciudad.toUpperCase() + " (" + pais.toUpperCase() + "), con renuncia a cualquier otro fuero.", fCuerpo));
        pC6.setAlignment(Element.ALIGN_JUSTIFIED);
        doc.add(pC6);
        doc.add(new Paragraph(" "));

        Paragraph pConformidad = new Paragraph("EN PRUEBA DE CONFORMIDAD FIRMAN ESTE DOCUMENTO POR DUPLICADO Y A UN SOLO EFECTO EN " + ciudad.toUpperCase() + " (" + pais.toUpperCase() + ") EN LA FECHA INDICADA.", fCuerpoBold);
        pConformidad.setAlignment(Element.ALIGN_CENTER);
        doc.add(pConformidad);
        doc.add(new Paragraph(" "));

        // Bloque de Firmas
        PdfPTable tFirmas = new PdfPTable(2);
        tFirmas.setWidthPercentage(100);
        tFirmas.setWidths(new float[]{50, 50});

        PdfPCell cF1 = new PdfPCell();
        cF1.setBorder(Rectangle.NO_BORDER);
        cF1.setPaddingTop(30);
        cF1.setHorizontalAlignment(Element.ALIGN_CENTER);
        Paragraph pf1 = new Paragraph("____________________________________\nNOEMI CONDORI BALCAS\n" + labelDoc + ": 30378592P\nPrestamista", fCuerpo);
        pf1.setAlignment(Element.ALIGN_CENTER);
        cF1.addElement(pf1);
        tFirmas.addCell(cF1);

        PdfPCell cF2 = new PdfPCell();
        cF2.setBorder(Rectangle.NO_BORDER);
        cF2.setPaddingTop(30);
        cF2.setHorizontalAlignment(Element.ALIGN_CENTER);
        Paragraph pf2 = new Paragraph("____________________________________\n" + prestamo.getCliente().getNombreCompleto().toUpperCase() + "\n" + labelDoc + ": " + prestamo.getCliente().getDni() + "\nPrestataria / Prestatario", fCuerpo);
        pf2.setAlignment(Element.ALIGN_CENTER);
        cF2.addElement(pf2);
        tFirmas.addCell(cF2);

        doc.add(tFirmas);
        doc.add(new Paragraph(" "));

        // Tabla Anexa de Amortización
        Paragraph pTabTit = new Paragraph("ANEXO: CALENDARIO DE AMORTIZACION Y PLAN DE PAGOS", fSubtitulo);
        pTabTit.setAlignment(Element.ALIGN_CENTER);
        doc.add(pTabTit);
        doc.add(new Paragraph(" "));

        List<Cuota> cuotas = cuotaRepository.findByPrestamoIdOrderByNroCuotaAsc(prestamo.getId());
        PdfPTable tCuotas = new PdfPTable(6);
        tCuotas.setWidthPercentage(100);
        tCuotas.setWidths(new float[]{10, 18, 18, 18, 18, 18});

        String[] cols = {"Cuota", "Vencimiento", "Total Cuota", "Capital", "Interes", "Saldo"};
        for (String col : cols) {
            PdfPCell ch = new PdfPCell(new Phrase(col, fTablaCab));
            ch.setBackgroundColor(COLOR_PRIMARIO);
            ch.setPadding(4);
            ch.setHorizontalAlignment(Element.ALIGN_CENTER);
            tCuotas.addCell(ch);
        }

        for (Cuota c : cuotas) {
            tCuotas.addCell(crearCeldaCentrada(String.valueOf(c.getNroCuota()), fTablaCelda));
            tCuotas.addCell(crearCeldaCentrada(c.getFechaVencimiento().toString(), fTablaCelda));
            tCuotas.addCell(crearCeldaDerecha(simbolo + " " + String.format("%.2f", c.getCuotaTotal()), fTablaCelda));
            tCuotas.addCell(crearCeldaDerecha(simbolo + " " + String.format("%.2f", c.getCapitalAmortizado()), fTablaCelda));
            tCuotas.addCell(crearCeldaDerecha(simbolo + " " + String.format("%.2f", c.getInteres()), fTablaCelda));
            tCuotas.addCell(crearCeldaDerecha(simbolo + " " + String.format("%.2f", c.getSaldoRestante()), fTablaCelda));
        }

        doc.add(tCuotas);
        doc.close();
    }

    private String formatearFechaEspanol(java.time.LocalDate fecha) {
        if (fecha == null) return "";
        String[] meses = {"enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"};
        int dia = fecha.getDayOfMonth();
        String mes = meses[fecha.getMonthValue() - 1];
        int anio = fecha.getYear();
        return (dia < 10 ? "0" + dia : String.valueOf(dia)) + " DE " + mes.toUpperCase() + " DE " + anio;
    }

    private String convertirNumeroALetras(BigDecimal cantidad, String nombreMoneda) {
        if (cantidad == null) return "CERO " + nombreMoneda;
        long total = cantidad.longValue();
        if (total == 5000) return "CINCO MIL " + nombreMoneda;
        if (total == 1000) return "UN MIL " + nombreMoneda;
        if (total == 2000) return "DOS MIL " + nombreMoneda;
        if (total == 3000) return "TRES MIL " + nombreMoneda;
        if (total == 4000) return "CUATRO MIL " + nombreMoneda;
        if (total == 10000) return "DIEZ MIL " + nombreMoneda;
        if (total == 15000) return "QUINCE MIL " + nombreMoneda;
        if (total == 20000) return "VEINTE MIL " + nombreMoneda;
        return String.valueOf(total) + " " + nombreMoneda;
    }

    // =========================================================================
    // 3. GENERADOR DE ESTADO DE CUENTA EN PDF (A4)
    // =========================================================================
    private void generarPdfEstadoCuenta(Prestamo prestamo, File destino) throws Exception {
        Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(doc, new FileOutputStream(destino));
        doc.open();

        Font fTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, COLOR_PRIMARIO);
        Font fSub = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, COLOR_SECUNDARIO);
        Font fTexto = FontFactory.getFont(FontFactory.HELVETICA, 8.5f, Color.DARK_GRAY);
        Font fValor = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);
        Font fTablaCab = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
        Font fTablaCelda = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);

        String simbolo = prestamo.getMoneda().name().equals("BOB") ? "Bs." : "EUR";

        Paragraph pTit = new Paragraph("ESTADO DE CUENTA DE CARTERA - CREDICORE BOLIVIA", fTitulo);
        pTit.setAlignment(Element.ALIGN_CENTER);
        doc.add(pTit);

        Paragraph pSub = new Paragraph("CREDITO N: " + prestamo.getCodigo() + " | CLIENTE: " + prestamo.getCliente().getNombreCompleto(), fSub);
        pSub.setAlignment(Element.ALIGN_CENTER);
        doc.add(pSub);
        doc.add(new Paragraph(" "));

        // Tarjetas resumen
        PdfPTable tResumen = new PdfPTable(4);
        tResumen.setWidthPercentage(100);
        agregarCeldaResumen(tResumen, "Capital Aprobado", simbolo + " " + String.format("%.2f", prestamo.getMontoSolicitado()), fTexto, fValor);
        agregarCeldaResumen(tResumen, "Saldo Pendiente", simbolo + " " + String.format("%.2f", prestamo.getSaldoActual()), fTexto, fValor);
        agregarCeldaResumen(tResumen, "Sistema / Tasa", prestamo.getTipoSistema() + " (" + prestamo.getTasaInteresMensual() + "%)", fTexto, fValor);
        agregarCeldaResumen(tResumen, "Estado Credito", prestamo.getEstado().name(), fTexto, fValor);
        doc.add(tResumen);
        doc.add(new Paragraph(" "));

        // Detalle de Cuotas
        List<Cuota> cuotas = cuotaRepository.findByPrestamoIdOrderByNroCuotaAsc(prestamo.getId());
        PdfPTable tCuotas = new PdfPTable(7);
        tCuotas.setWidthPercentage(100);
        tCuotas.setWidths(new float[]{8, 15, 16, 16, 15, 15, 15});

        String[] cols = {"Cuota", "Vencimiento", "Total Cuota", "Capital", "Interes", "Saldo", "Estado"};
        for (String col : cols) {
            PdfPCell ch = new PdfPCell(new Phrase(col, fTablaCab));
            ch.setBackgroundColor(COLOR_PRIMARIO);
            ch.setPadding(5);
            ch.setHorizontalAlignment(Element.ALIGN_CENTER);
            tCuotas.addCell(ch);
        }

        for (Cuota c : cuotas) {
            Font fEst = (c.getEstado().name().equals("PAGADA"))
                    ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, COLOR_EXITO)
                    : FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, COLOR_ALERTA);

            tCuotas.addCell(crearCeldaCentrada(String.valueOf(c.getNroCuota()), fTablaCelda));
            tCuotas.addCell(crearCeldaCentrada(c.getFechaVencimiento().toString(), fTablaCelda));
            tCuotas.addCell(crearCeldaDerecha(simbolo + " " + String.format("%.2f", c.getCuotaTotal()), fTablaCelda));
            tCuotas.addCell(crearCeldaDerecha(simbolo + " " + String.format("%.2f", c.getCapitalAmortizado()), fTablaCelda));
            tCuotas.addCell(crearCeldaDerecha(simbolo + " " + String.format("%.2f", c.getInteres()), fTablaCelda));
            tCuotas.addCell(crearCeldaDerecha(simbolo + " " + String.format("%.2f", c.getSaldoRestante()), fTablaCelda));
            tCuotas.addCell(crearCeldaCentrada(c.getEstado().name(), fEst));
        }

        doc.add(tCuotas);
        doc.close();
    }

    private void agregarCeldaResumen(PdfPTable table, String titulo, String valor, Font fTit, Font fVal) {
        PdfPCell c = new PdfPCell();
        c.setBackgroundColor(COLOR_FONDO_CLARO);
        c.setBorderColor(COLOR_BORDE);
        c.setPadding(8);
        c.addElement(new Paragraph(titulo, fTit));
        c.addElement(new Paragraph(valor, fVal));
        table.addCell(c);
    }

    private PdfPCell crearCelda(String texto, Font f) {
        PdfPCell c = new PdfPCell(new Phrase(texto, f));
        c.setPadding(5);
        c.setBorderColor(COLOR_BORDE);
        return c;
    }

    private PdfPCell crearCeldaCentrada(String texto, Font f) {
        PdfPCell c = crearCelda(texto, f);
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        return c;
    }

    private PdfPCell crearCeldaDerecha(String texto, Font f) {
        PdfPCell c = crearCelda(texto, f);
        c.setHorizontalAlignment(Element.ALIGN_RIGHT);
        return c;
    }
}
