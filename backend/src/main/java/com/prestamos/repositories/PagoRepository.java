package com.prestamos.repositories;

import com.prestamos.entities.Moneda;
import com.prestamos.entities.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByPrestamoIdOrderByFechaPagoDesc(Long prestamoId);

    long countByPrestamoId(Long prestamoId);

    @Query("SELECT COALESCE(SUM(p.montoPagado), 0) FROM Pago p " +
           "JOIN p.cuota c JOIN c.prestamo pr " +
           "WHERE pr.moneda = :moneda AND p.fechaPago >= :desde AND p.fechaPago <= :hasta")
    BigDecimal sumPagosByMonedaAndFechaRange(
            @Param("moneda") Moneda moneda,
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta
    );

    @Query("SELECT COUNT(p) FROM Pago p")
    Long countTotalPagos();
}
