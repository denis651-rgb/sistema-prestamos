package com.prestamos.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "cuotas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cuota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "prestamo_id")
    @JsonBackReference
    private Prestamo prestamo;

    private Integer nroCuota;
    private LocalDate fechaVencimiento;

    @Column(precision = 12, scale = 2)
    private BigDecimal cuotaTotal;

    @Column(precision = 12, scale = 2)
    private BigDecimal interes;

    @Column(precision = 12, scale = 2)
    private BigDecimal capitalAmortizado;

    @Column(precision = 12, scale = 2)
    private BigDecimal saldoRestante;

    @Enumerated(EnumType.STRING)
    private EstadoCuota estado; // PENDIENTE, PAGADA
}
