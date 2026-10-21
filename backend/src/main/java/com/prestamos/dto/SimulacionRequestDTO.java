package com.prestamos.dto;

import com.prestamos.entities.Moneda;
import com.prestamos.entities.TipoSistema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SimulacionRequestDTO {
    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal monto;

    @NotNull(message = "La tasa mensual es obligatoria")
    @DecimalMin(value = "0.00", message = "La tasa no puede ser negativa")
    private BigDecimal tasaMensualPct;

    @NotNull(message = "El plazo en meses es obligatorio")
    @Min(value = 1, message = "El plazo mínimo es 1 mes")
    private Integer plazoMeses;

    @NotNull(message = "El sistema de amortización es obligatorio")
    private TipoSistema tipoSistema;

    private Moneda moneda;
    private LocalDate fechaInicio;
}
