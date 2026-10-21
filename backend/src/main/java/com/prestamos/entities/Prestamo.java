package com.prestamos.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "prestamos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Prestamo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String codigo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    private String garanteNombre;
    private String garanteDni;

    private String ciudad;
    private String pais;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Moneda moneda; // BOB, EUR

    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal montoSolicitado;

    @Column(precision = 5, scale = 2, nullable = false)
    private BigDecimal tasaInteresMensual;

    @Column(nullable = false)
    private Integer plazoMeses;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoSistema tipoSistema; // FRANCES, ALEMAN

    @Column(nullable = false)
    private LocalDate fechaInicio;

    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal saldoActual;

    @Enumerated(EnumType.STRING)
    private EstadoPrestamo estado; // ACTIVO, CANCELADO

    @OneToMany(mappedBy = "prestamo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("nroCuota ASC")
    @JsonManagedReference
    private List<Cuota> cuotas;
}
