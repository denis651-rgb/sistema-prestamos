package com.prestamos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteDTO {
    private Long id;
    private String dni;
    private String nombreCompleto;
    private String telefono;
    private String direccion;
    private String email;
    private LocalDateTime fechaRegistro;
    private int cantidadPrestamos;
}
