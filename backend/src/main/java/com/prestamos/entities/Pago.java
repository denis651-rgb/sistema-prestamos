package com.prestamos.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nro_recibo", unique = true, nullable = false)
    private String nroRecibo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cuota_id")
    private Cuota cuota;

    @Column(nullable = false)
    private Long prestamoId;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal montoPagado;

    @Column(nullable = false)
    private LocalDateTime fechaPago;

    private String metodoPago; // EFECTIVO, TRANSFERENCIA, QR
    private String notas;
}
