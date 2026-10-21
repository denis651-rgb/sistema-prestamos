package com.prestamos.services;

import com.prestamos.dto.CuotaCalculadaDTO;
import com.prestamos.entities.TipoSistema;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class EngineFinancieroService {

    public List<CuotaCalculadaDTO> generarCronograma(
            BigDecimal monto,
            BigDecimal tasaMensualPct,
            int plazoMeses,
            LocalDate fechaInicio,
            TipoSistema tipo
    ) {
        if (fechaInicio == null) {
            fechaInicio = LocalDate.now();
        }

        List<CuotaCalculadaDTO> lista = new ArrayList<>();
        BigDecimal tasaDecimal = tasaMensualPct.divide(BigDecimal.valueOf(100), 8, RoundingMode.HALF_UP);
        BigDecimal saldo = monto;

        // Caso con tasa 0%
        if (tasaDecimal.compareTo(BigDecimal.ZERO) == 0) {
            BigDecimal amortizacionConstante = monto.divide(BigDecimal.valueOf(plazoMeses), 2, RoundingMode.HALF_UP);
            for (int k = 1; k <= plazoMeses; k++) {
                BigDecimal amortizacion = (k == plazoMeses) ? saldo : amortizacionConstante;
                BigDecimal cuotaTotal = amortizacion;
                saldo = saldo.subtract(amortizacion).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
                lista.add(new CuotaCalculadaDTO(k, fechaInicio.plusMonths(k), cuotaTotal, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), amortizacion, saldo));
            }
            return lista;
        }

        if (tipo == TipoSistema.FRANCES) {
            // Factor: (1 + i)^n
            double factorDouble = Math.pow(BigDecimal.ONE.add(tasaDecimal).doubleValue(), plazoMeses);
            BigDecimal factor = BigDecimal.valueOf(factorDouble);

            // Cuota fija = P * [ i * factor / (factor - 1) ]
            BigDecimal numerador = tasaDecimal.multiply(factor);
            BigDecimal denominador = factor.subtract(BigDecimal.ONE);
            BigDecimal cuotaFija = monto.multiply(numerador.divide(denominador, 8, RoundingMode.HALF_UP))
                                        .setScale(2, RoundingMode.HALF_UP);

            for (int k = 1; k <= plazoMeses; k++) {
                BigDecimal interes = saldo.multiply(tasaDecimal).setScale(2, RoundingMode.HALF_UP);
                BigDecimal amortizacion = (k == plazoMeses) ? saldo : cuotaFija.subtract(interes).setScale(2, RoundingMode.HALF_UP);
                BigDecimal cuotaTotal = amortizacion.add(interes).setScale(2, RoundingMode.HALF_UP);
                saldo = saldo.subtract(amortizacion).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

                lista.add(new CuotaCalculadaDTO(k, fechaInicio.plusMonths(k), cuotaTotal, interes, amortizacion, saldo));
            }
        } else {
            // Sistema Alemán: Amortización constante = P / n
            BigDecimal amortizacionConstante = monto.divide(BigDecimal.valueOf(plazoMeses), 2, RoundingMode.HALF_UP);

            for (int k = 1; k <= plazoMeses; k++) {
                BigDecimal interes = saldo.multiply(tasaDecimal).setScale(2, RoundingMode.HALF_UP);
                BigDecimal amortizacion = (k == plazoMeses) ? saldo : amortizacionConstante;
                BigDecimal cuotaTotal = amortizacion.add(interes).setScale(2, RoundingMode.HALF_UP);
                saldo = saldo.subtract(amortizacion).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

                lista.add(new CuotaCalculadaDTO(k, fechaInicio.plusMonths(k), cuotaTotal, interes, amortizacion, saldo));
            }
        }
        return lista;
    }
}
