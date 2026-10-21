package com.prestamos.repositories;

import com.prestamos.entities.EstadoPrestamo;
import com.prestamos.entities.Moneda;
import com.prestamos.entities.Prestamo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {
    Optional<Prestamo> findByCodigo(String codigo);
    List<Prestamo> findByEstadoOrderByFechaInicioDesc(EstadoPrestamo estado);
    List<Prestamo> findAllByOrderByFechaInicioDesc();

    Long countByEstado(EstadoPrestamo estado);

    @Query("SELECT COALESCE(SUM(p.montoSolicitado), 0) FROM Prestamo p WHERE p.moneda = :moneda")
    BigDecimal sumMontoSolicitadoByMoneda(@Param("moneda") Moneda moneda);

    @Query("SELECT COALESCE(SUM(p.saldoActual), 0) FROM Prestamo p WHERE p.moneda = :moneda AND p.estado = 'ACTIVO'")
    BigDecimal sumSaldoActualByMonedaAndActivo(@Param("moneda") Moneda moneda);
}
