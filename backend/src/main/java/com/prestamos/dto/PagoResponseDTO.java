package com.prestamos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagoResponseDTO {
    private Long id;
    private String nroRecibo;
    private Long prestamoId;
    private String prestamoCodigo;
    private Long cuotaId;
    private Integer nroCuota;
    private String clienteNombre;
    private String clienteDni;
    private String moneda;
    private BigDecimal montoPagado;
    private BigDecimal capitalAmortizado;
    private BigDecimal interesPagado;
    private BigDecimal saldoRestantePrestamo;
    private LocalDateTime fechaPago;
    private String metodoPago;
    private String estadoPrestamo;
    private String notas;
}
