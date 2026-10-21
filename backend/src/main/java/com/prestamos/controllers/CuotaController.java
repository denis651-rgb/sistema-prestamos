package com.prestamos.controllers;

import com.prestamos.dto.PagoRequestDTO;
import com.prestamos.dto.PagoResponseDTO;
import com.prestamos.services.PagoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cuotas")
public class CuotaController {

    @Autowired
    private PagoService pagoService;

    @PostMapping("/{cuotaId}/pagos")
    public ResponseEntity<PagoResponseDTO> registrarPago(
            @PathVariable Long cuotaId,
            @Valid @RequestBody PagoRequestDTO req
    ) {
        PagoResponseDTO response = pagoService.registrarPago(cuotaId, req);
        return ResponseEntity.ok(response);
    }
}
