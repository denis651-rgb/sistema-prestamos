package com.prestamos.controllers;

import com.prestamos.dto.ResumenDashboardDTO;
import com.prestamos.services.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/resumen")
    public ResponseEntity<ResumenDashboardDTO> resumen() {
        return ResponseEntity.ok(dashboardService.obtenerResumen());
    }
}
