package com.prestamos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumenDashboardDTO {
    // Totales en BOB
    private BigDecimal totalColocadoBOB;
    private BigDecimal saldoPendienteBOB;
    private BigDecimal cobradoHoyBOB;

    // Totales en EUR
    private BigDecimal totalColocadoEUR;
    private BigDecimal saldoPendienteEUR;
    private BigDecimal cobradoHoyEUR;

    // Conteo y actividad
    private Long prestamosActivos;
    private Long prestamosCancelados;
    private Long totalClientes;
    private Long cuotasPendientesHoy;
    private Long cuotasVencidas;
}
