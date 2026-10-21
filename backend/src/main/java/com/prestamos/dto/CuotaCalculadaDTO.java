package com.prestamos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CuotaCalculadaDTO {
    private Integer nroCuota;
    private LocalDate fechaVencimiento;
    private BigDecimal cuotaTotal;
    private BigDecimal interes;
    private BigDecimal amortizacion;
    private BigDecimal saldoRestante;
}
