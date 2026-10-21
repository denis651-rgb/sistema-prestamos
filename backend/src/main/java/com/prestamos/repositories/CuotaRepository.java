package com.prestamos.repositories;

import com.prestamos.entities.Cuota;
import com.prestamos.entities.EstadoCuota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CuotaRepository extends JpaRepository<Cuota, Long> {
    List<Cuota> findByPrestamoIdOrderByNroCuotaAsc(Long prestamoId);

    long countByPrestamoIdAndEstado(Long prestamoId, EstadoCuota estado);

    @Query("SELECT COUNT(c) FROM Cuota c WHERE c.estado = 'PENDIENTE' AND c.fechaVencimiento < :fecha")
    Long countCuotasVencidas(@Param("fecha") LocalDate fecha);

    @Query("SELECT COUNT(c) FROM Cuota c WHERE c.estado = 'PENDIENTE' AND c.fechaVencimiento = :fecha")
    Long countCuotasVencenHoy(@Param("fecha") LocalDate fecha);
}
