package com.prestamos.services;

import com.prestamos.dto.PagoRequestDTO;
import com.prestamos.dto.PagoResponseDTO;
import com.prestamos.entities.*;
import com.prestamos.repositories.CuotaRepository;
import com.prestamos.repositories.PagoRepository;
import com.prestamos.repositories.PrestamoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PagoService {

    @Autowired
    private CuotaRepository cuotaRepository;

    @Autowired
    private PrestamoRepository prestamoRepository;

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private ExpedienteDigitalService expedienteDigitalService;

    @Transactional
    public PagoResponseDTO registrarPago(Long cuotaId, PagoRequestDTO req) {
        Cuota cuota = cuotaRepository.findById(cuotaId)
                .orElseThrow(() -> new IllegalArgumentException("Cuota no encontrada con id: " + cuotaId));

        if (cuota.getEstado() == EstadoCuota.PAGADA) {
            throw new IllegalStateException("La cuota nro " + cuota.getNroCuota() + " ya se encuentra pagada.");
        }

        Prestamo prestamo = cuota.getPrestamo();

        // 1. Marcar cuota como PAGADA
        cuota.setEstado(EstadoCuota.PAGADA);
        cuotaRepository.save(cuota);

        // 2. Descontar la amortización de capital del saldo deudor del préstamo
        BigDecimal nuevoSaldo = prestamo.getSaldoActual()
                .subtract(cuota.getCapitalAmortizado())
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);
        prestamo.setSaldoActual(nuevoSaldo);

        // 3. Si todas las cuotas están pagadas o el saldo es 0, marcar préstamo CANCELADO
        List<Cuota> todasLasCuotas = cuotaRepository.findByPrestamoIdOrderByNroCuotaAsc(prestamo.getId());
        boolean todasPagadas = todasLasCuotas.stream().allMatch(c -> c.getEstado() == EstadoCuota.PAGADA);
        if (todasPagadas || nuevoSaldo.compareTo(BigDecimal.ZERO) == 0) {
            prestamo.setEstado(EstadoPrestamo.CANCELADO);
        }
        prestamoRepository.save(prestamo);

        // 4. Generar número de recibo correlativo (ej: REC-000012)
        long totalPagos = pagoRepository.count() + 1;
        String nroRecibo = String.format("REC-%06d", totalPagos);

        // 5. Registrar el pago
        Pago pago = Pago.builder()
                .nroRecibo(nroRecibo)
                .cuota(cuota)
                .prestamoId(prestamo.getId())
                .montoPagado(req.getMonto() != null ? req.getMonto() : cuota.getCuotaTotal())
                .fechaPago(LocalDateTime.now())
                .metodoPago(req.getMetodoPago() != null ? req.getMetodoPago() : "EFECTIVO")
                .notas(req.getNotas())
                .build();

        Pago pagoGuardado = pagoRepository.save(pago);
        expedienteDigitalService.guardarFacturaPago(pagoGuardado, prestamo, cuota, nuevoSaldo);

        return PagoResponseDTO.builder()
                .id(pagoGuardado.getId())
                .nroRecibo(pagoGuardado.getNroRecibo())
                .prestamoId(prestamo.getId())
                .prestamoCodigo(prestamo.getCodigo())
                .cuotaId(cuota.getId())
                .nroCuota(cuota.getNroCuota())
                .clienteNombre(prestamo.getCliente().getNombreCompleto())
                .clienteDni(prestamo.getCliente().getDni())
                .moneda(prestamo.getMoneda().name())
                .montoPagado(pagoGuardado.getMontoPagado())
                .capitalAmortizado(cuota.getCapitalAmortizado())
                .interesPagado(cuota.getInteres())
                .saldoRestantePrestamo(nuevoSaldo)
                .fechaPago(pagoGuardado.getFechaPago())
                .metodoPago(pagoGuardado.getMetodoPago())
                .estadoPrestamo(prestamo.getEstado().name())
                .notas(pagoGuardado.getNotas())
                .build();
    }
}
