package com.prestamos.controllers;

import com.prestamos.dto.CuotaCalculadaDTO;
import com.prestamos.dto.SimulacionRequestDTO;
import com.prestamos.dto.SolicitudPrestamoDTO;
import com.prestamos.entities.Prestamo;
import com.prestamos.services.PrestamoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/prestamos")
public class PrestamoController {

    @Autowired
    private PrestamoService prestamoService;

    @PostMapping("/simular")
    public ResponseEntity<List<CuotaCalculadaDTO>> simular(@Valid @RequestBody SimulacionRequestDTO req) {
        List<CuotaCalculadaDTO> cronograma = prestamoService.simular(req);
        return ResponseEntity.ok(cronograma);
    }

    @PostMapping
    public ResponseEntity<Prestamo> crearPrestamo(@Valid @RequestBody SolicitudPrestamoDTO req) {
        Prestamo prestamo = prestamoService.crearPrestamo(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(prestamo);
    }

    @GetMapping
    public ResponseEntity<List<Prestamo>> listarTodos() {
        List<Prestamo> lista = prestamoService.listarTodos();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prestamo> obtenerPorId(@PathVariable Long id) {
        return prestamoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prestamo> editarPrestamo(@PathVariable Long id, @Valid @RequestBody SolicitudPrestamoDTO req) {
        Prestamo prestamo = prestamoService.editarPrestamo(id, req);
        return ResponseEntity.ok(prestamo);
    }
}
