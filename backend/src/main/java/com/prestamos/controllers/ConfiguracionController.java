package com.prestamos.controllers;

import com.prestamos.entities.ConfiguracionEmpresa;
import com.prestamos.services.ConfiguracionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/configuracion")
public class ConfiguracionController {

    @Autowired
    private ConfiguracionService configuracionService;

    @GetMapping
    public ResponseEntity<ConfiguracionEmpresa> obtener() {
        return ResponseEntity.ok(configuracionService.obtenerConfiguracion());
    }

    @PutMapping
    public ResponseEntity<ConfiguracionEmpresa> guardar(@RequestBody ConfiguracionEmpresa nueva) {
        return ResponseEntity.ok(configuracionService.guardarConfiguracion(nueva));
    }
}
