package com.prestamos.dto;

import com.prestamos.entities.Moneda;
import com.prestamos.entities.TipoSistema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SolicitudPrestamoDTO {
    @NotBlank(message = "El DNI/CI del cliente es obligatorio")
    private String clienteDni;

    @NotBlank(message = "El nombre del cliente es obligatorio")
    private String clienteNombre;

    private String clienteTelefono;
    private String clienteDireccion;
    private String clienteEmail;

    private String garanteNombre;
    private String garanteDni;

    private String ciudad;
    private String pais;

    @NotNull(message = "La moneda es obligatoria")
    private Moneda moneda; // BOB o EUR

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "1.00", message = "El monto debe ser al menos 1.00")
    private BigDecimal monto;

    @NotNull(message = "La tasa mensual es obligatoria")
    @DecimalMin(value = "0.00", message = "La tasa no puede ser negativa")
    private BigDecimal tasaMensualPct;

    @NotNull(message = "El plazo en meses es obligatorio")
    @Min(value = 1, message = "El plazo mínimo es 1 mes")
    private Integer plazoMeses;

    @NotNull(message = "El tipo de sistema es obligatorio")
    private TipoSistema tipoSistema; // FRANCES o ALEMAN

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;
}
