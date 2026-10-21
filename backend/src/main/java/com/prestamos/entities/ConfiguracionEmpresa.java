package com.prestamos.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "configuracion_empresa")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionEmpresa {

    @Id
    private Long id; // Siempre 1L (registro único de configuración)

    @Column(nullable = false)
    private String tipoComprobante; // Ej: "RECIBO DE PAGO OFICIAL", "COMPROBANTE DE COBRO", "FACTURA COMERCIAL"

    private String subtituloComprobante; // Ej: "Constancia de Cancelación de Cuota", "Documento no válido para crédito fiscal"

    @Column(nullable = false)
    private String nombreEmisor; // Ej: "NOEMI CONDORI BALCAS"

    private String documentoIdentidad; // Ej: "30378592P" o NIT

    private String etiquetaDocumento; // Ej: "DNI", "C.I.", "NIT", "N.I.F."

    private String actividad; // Ej: "Gestión de Préstamos Personales & Microcréditos"

    private String direccion; // Ej: "C. Teodora Lamadrid 37, 3º 4ª, Barcelona"

    private String telefono; // Ej: "+34 612 345 678"

    private String ciudadPais; // Ej: "Barcelona, España" o "Cochabamba, Bolivia"

    @Column(length = 500)
    private String pieComprobante; // Ej: "Conserve este comprobante como constancia legal de pago."

    private Boolean mostrarQr; // true/false

    private Boolean mostrarCreditoFiscal; // true/false (por defecto false)
}
