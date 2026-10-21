package com.prestamos.services;

import com.prestamos.entities.ConfiguracionEmpresa;
import com.prestamos.repositories.ConfiguracionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConfiguracionService {

    @Autowired
    private ConfiguracionRepository configuracionRepository;

    @Transactional
    public ConfiguracionEmpresa obtenerConfiguracion() {
        return configuracionRepository.findById(1L).orElseGet(() -> {
            ConfiguracionEmpresa porDefecto = ConfiguracionEmpresa.builder()
                    .id(1L)
                    .tipoComprobante("RECIBO DE PAGO OFICIAL")
                    .subtituloComprobante("Constancia de Cancelación de Cuota")
                    .nombreEmisor("NOEMI CONDORI BALCAS")
                    .documentoIdentidad("30378592P")
                    .etiquetaDocumento("DNI")
                    .actividad("Gestión de Préstamos Personales & Microcréditos")
                    .direccion("C. Teodora Lamadrid 37, 3º 4ª, Barcelona")
                    .telefono("+34 612 345 678")
                    .ciudadPais("Barcelona, España")
                    .pieComprobante("Conserve este comprobante como constancia legal de pago. Gracias por su puntualidad.")
                    .mostrarQr(true)
                    .mostrarCreditoFiscal(false)
                    .build();
            return configuracionRepository.save(porDefecto);
        });
    }

    @Transactional
    public ConfiguracionEmpresa guardarConfiguracion(ConfiguracionEmpresa nueva) {
        nueva.setId(1L);
        if (nueva.getTipoComprobante() == null || nueva.getTipoComprobante().isBlank()) {
            nueva.setTipoComprobante("RECIBO DE PAGO OFICIAL");
        }
        if (nueva.getNombreEmisor() == null || nueva.getNombreEmisor().isBlank()) {
            nueva.setNombreEmisor("NOEMI CONDORI BALCAS");
        }
        if (nueva.getMostrarCreditoFiscal() == null) {
            nueva.setMostrarCreditoFiscal(false);
        }
        if (nueva.getMostrarQr() == null) {
            nueva.setMostrarQr(true);
        }
        return configuracionRepository.save(nueva);
    }
}
