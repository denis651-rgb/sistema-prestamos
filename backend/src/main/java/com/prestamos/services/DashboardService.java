package com.prestamos.services;

import com.prestamos.dto.ResumenDashboardDTO;
import com.prestamos.entities.EstadoPrestamo;
import com.prestamos.entities.Moneda;
import com.prestamos.repositories.ClienteRepository;
import com.prestamos.repositories.CuotaRepository;
import com.prestamos.repositories.PagoRepository;
import com.prestamos.repositories.PrestamoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class DashboardService {

    @Autowired
    private PrestamoRepository prestamoRepository;

    @Autowired
    private CuotaRepository cuotaRepository;

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional(readOnly = true)
    public ResumenDashboardDTO obtenerResumen() {
        LocalDate hoy = LocalDate.now();
        LocalDateTime inicioHoy = hoy.atStartOfDay();
        LocalDateTime finHoy = hoy.atTime(LocalTime.MAX);

        BigDecimal colocadoBOB = prestamoRepository.sumMontoSolicitadoByMoneda(Moneda.BOB);
        BigDecimal saldoBOB = prestamoRepository.sumSaldoActualByMonedaAndActivo(Moneda.BOB);
        BigDecimal cobradoHoyBOB = pagoRepository.sumPagosByMonedaAndFechaRange(Moneda.BOB, inicioHoy, finHoy);

        BigDecimal colocadoEUR = prestamoRepository.sumMontoSolicitadoByMoneda(Moneda.EUR);
        BigDecimal saldoEUR = prestamoRepository.sumSaldoActualByMonedaAndActivo(Moneda.EUR);
        BigDecimal cobradoHoyEUR = pagoRepository.sumPagosByMonedaAndFechaRange(Moneda.EUR, inicioHoy, finHoy);

        Long activos = prestamoRepository.countByEstado(EstadoPrestamo.ACTIVO);
        Long cancelados = prestamoRepository.countByEstado(EstadoPrestamo.CANCELADO);
        Long clientes = clienteRepository.count();
        Long cuotasHoy = cuotaRepository.countCuotasVencenHoy(hoy);
        Long cuotasVencidas = cuotaRepository.countCuotasVencidas(hoy);

        return ResumenDashboardDTO.builder()
                .totalColocadoBOB(colocadoBOB)
                .saldoPendienteBOB(saldoBOB)
                .cobradoHoyBOB(cobradoHoyBOB)
                .totalColocadoEUR(colocadoEUR)
                .saldoPendienteEUR(saldoEUR)
                .cobradoHoyEUR(cobradoHoyEUR)
                .prestamosActivos(activos)
                .prestamosCancelados(cancelados)
                .totalClientes(clientes)
                .cuotasPendientesHoy(cuotasHoy)
                .cuotasVencidas(cuotasVencidas)
                .build();
    }
}
