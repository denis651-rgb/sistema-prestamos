package com.prestamos.controllers;

import com.prestamos.services.ExpedienteDigitalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/expedientes")
public class ExpedienteController {

    @Autowired
    private ExpedienteDigitalService expedienteService;

    @PostMapping("/abrir")
    public ResponseEntity<Map<String, Object>> abrirCarpetaCliente(@RequestParam String dni) {
        boolean opened = expedienteService.abrirCarpetaEnExplorador(dni);
        return ResponseEntity.ok(Map.of("success", opened, "dni", dni));
    }

    @PostMapping("/abrir-raiz")
    public ResponseEntity<Map<String, Object>> abrirCarpetaRaiz() {
        boolean opened = expedienteService.abrirCarpetaRaiz();
        return ResponseEntity.ok(Map.of("success", opened, "ruta", expedienteService.getDirectorioRaizEscritorio().getAbsolutePath()));
    }

    @PostMapping("/sincronizar")
    public ResponseEntity<Map<String, Object>> sincronizar() {
        expedienteService.sincronizarTodo();
        return ResponseEntity.ok(Map.of("success", true, "ruta", expedienteService.getDirectorioRaizEscritorio().getAbsolutePath()));
    }
}
