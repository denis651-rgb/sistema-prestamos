package com.prestamos.services;

import com.prestamos.dto.CuotaCalculadaDTO;
import com.prestamos.dto.SimulacionRequestDTO;
import com.prestamos.dto.SolicitudPrestamoDTO;
import com.prestamos.entities.*;
import com.prestamos.repositories.CuotaRepository;
import com.prestamos.repositories.PrestamoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import com.prestamos.repositories.PagoRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PrestamoService {

    @Autowired
    private PrestamoRepository prestamoRepository;

    @Autowired
    private CuotaRepository cuotaRepository;

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private EngineFinancieroService engineFinanciero;

    @Autowired
    private ExpedienteDigitalService expedienteDigitalService;

    @Autowired
    private PagoRepository pagoRepository;

    public List<CuotaCalculadaDTO> simular(SimulacionRequestDTO req) {
        LocalDate fecha = (req.getFechaInicio() != null) ? req.getFechaInicio() : LocalDate.now();
        return engineFinanciero.generarCronograma(
                req.getMonto(),
                req.getTasaMensualPct(),
                req.getPlazoMeses(),
                fecha,
                req.getTipoSistema()
        );
    }

    @Transactional
    public Prestamo crearPrestamo(SolicitudPrestamoDTO req) {
        // 1. Obtener o registrar cliente
        Cliente cliente = clienteService.guardarOActualizar(Cliente.builder()
                .dni(req.getClienteDni().trim())
                .nombreCompleto(req.getClienteNombre().trim())
                .telefono(req.getClienteTelefono())
                .direccion(req.getClienteDireccion())
                .email(req.getClienteEmail())
                .build());

        // 2. Generar correlativo de código de préstamo (ej: PREST-2026-0001)
        long totalPrestamos = prestamoRepository.count() + 1;
        String codigo = String.format("PREST-%d-%04d", req.getFechaInicio().getYear(), totalPrestamos);

        // 3. Crear entidad Prestamo
        Prestamo prestamo = Prestamo.builder()
                .codigo(codigo)
                .cliente(cliente)
                .garanteNombre(req.getGaranteNombre())
                .garanteDni(req.getGaranteDni())
                .moneda(req.getMoneda())
                .montoSolicitado(req.getMonto())
                .tasaInteresMensual(req.getTasaMensualPct())
                .plazoMeses(req.getPlazoMeses())
                .tipoSistema(req.getTipoSistema())
                .fechaInicio(req.getFechaInicio())
                .ciudad(req.getCiudad() != null && !req.getCiudad().isBlank() ? req.getCiudad().trim() : (req.getMoneda() == Moneda.EUR ? "Barcelona" : "Cochabamba"))
                .pais(req.getPais() != null && !req.getPais().isBlank() ? req.getPais().trim() : (req.getMoneda() == Moneda.EUR ? "España" : "Bolivia"))
                .saldoActual(req.getMonto())
                .estado(EstadoPrestamo.ACTIVO)
                .build();

        // 4. Calcular cuotas con el engine financiero
        List<CuotaCalculadaDTO> cuotasCalculadas = engineFinanciero.generarCronograma(
                req.getMonto(),
                req.getTasaMensualPct(),
                req.getPlazoMeses(),
                req.getFechaInicio(),
                req.getTipoSistema()
        );

        List<Cuota> cuotas = new ArrayList<>();
        for (CuotaCalculadaDTO dto : cuotasCalculadas) {
            Cuota cuota = Cuota.builder()
                    .prestamo(prestamo)
                    .nroCuota(dto.getNroCuota())
                    .fechaVencimiento(dto.getFechaVencimiento())
                    .cuotaTotal(dto.getCuotaTotal())
                    .interes(dto.getInteres())
                    .capitalAmortizado(dto.getAmortizacion())
                    .saldoRestante(dto.getSaldoRestante())
                    .estado(EstadoCuota.PENDIENTE)
                    .build();
            cuotas.add(cuota);
        }

        prestamo.setCuotas(cuotas);
        Prestamo guardado = prestamoRepository.save(prestamo);
        expedienteDigitalService.guardarContratoYFicha(guardado);
        return guardado;
    }

    @Transactional(readOnly = true)
    public List<Prestamo> listarTodos() {
        return prestamoRepository.findAllByOrderByFechaInicioDesc();
    }

    @Transactional(readOnly = true)
    public Optional<Prestamo> obtenerPorId(Long id) {
        return prestamoRepository.findById(id);
    }

    @Transactional
    public Prestamo editarPrestamo(Long id, SolicitudPrestamoDTO req) {
        Prestamo prestamo = prestamoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Préstamo no encontrado"));

        // Regla de Negocio: No se puede editar si ya tiene al menos 1 pago
        long pagosCount = pagoRepository.countByPrestamoId(id);
        long cuotasPagadas = cuotaRepository.countByPrestamoIdAndEstado(id, EstadoCuota.PAGADA);
        if (pagosCount > 0 || cuotasPagadas > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El contrato no se puede editar porque ya cuenta con pagos registrados.");
        }

        // 1. Actualizar datos del cliente
        Cliente cliente = prestamo.getCliente();
        if (req.getClienteNombre() != null && !req.getClienteNombre().isBlank()) {
            cliente.setNombreCompleto(req.getClienteNombre().trim());
        }
        if (req.getClienteDni() != null && !req.getClienteDni().isBlank()) {
            cliente.setDni(req.getClienteDni().trim());
        }
        cliente.setTelefono(req.getClienteTelefono());
        cliente.setDireccion(req.getClienteDireccion());
        cliente.setEmail(req.getClienteEmail());
        clienteService.guardarOActualizar(cliente);

        // 2. Actualizar datos del Préstamo
        prestamo.setGaranteNombre(req.getGaranteNombre());
        prestamo.setGaranteDni(req.getGaranteDni());
        prestamo.setMoneda(req.getMoneda());
        prestamo.setMontoSolicitado(req.getMonto());
        prestamo.setTasaInteresMensual(req.getTasaMensualPct());
        prestamo.setPlazoMeses(req.getPlazoMeses());
        prestamo.setTipoSistema(req.getTipoSistema());
        prestamo.setFechaInicio(req.getFechaInicio());
        prestamo.setSaldoActual(req.getMonto());

        if (req.getCiudad() != null && !req.getCiudad().isBlank()) {
            prestamo.setCiudad(req.getCiudad().trim());
        }
        if (req.getPais() != null && !req.getPais().isBlank()) {
            prestamo.setPais(req.getPais().trim());
        }

        // 3. Eliminar cuotas anteriores y recalcular cronograma
        cuotaRepository.deleteAll(prestamo.getCuotas());
        prestamo.getCuotas().clear();

        List<CuotaCalculadaDTO> cuotasCalculadas = engineFinanciero.generarCronograma(
                req.getMonto(),
                req.getTasaMensualPct(),
                req.getPlazoMeses(),
                req.getFechaInicio(),
                req.getTipoSistema()
        );

        List<Cuota> nuevasCuotas = new ArrayList<>();
        for (CuotaCalculadaDTO dto : cuotasCalculadas) {
            Cuota cuota = Cuota.builder()
                    .prestamo(prestamo)
                    .nroCuota(dto.getNroCuota())
                    .fechaVencimiento(dto.getFechaVencimiento())
                    .cuotaTotal(dto.getCuotaTotal())
                    .interes(dto.getInteres())
                    .capitalAmortizado(dto.getAmortizacion())
                    .saldoRestante(dto.getSaldoRestante())
                    .estado(EstadoCuota.PENDIENTE)
                    .build();
            nuevasCuotas.add(cuota);
        }

        prestamo.setCuotas(nuevasCuotas);
        Prestamo guardado = prestamoRepository.save(prestamo);

        // 4. Actualizar expediente y contrato PDF en el Escritorio
        expedienteDigitalService.guardarContratoYFicha(guardado);

        return guardado;
    }
}
