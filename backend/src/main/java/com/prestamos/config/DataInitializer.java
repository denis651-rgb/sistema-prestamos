package com.prestamos.config;

import com.prestamos.dto.SolicitudPrestamoDTO;
import com.prestamos.entities.Moneda;
import com.prestamos.entities.TipoSistema;
import com.prestamos.repositories.ClienteRepository;
import com.prestamos.repositories.PrestamoRepository;
import com.prestamos.services.PrestamoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private PrestamoRepository prestamoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private PrestamoService prestamoService;

    @Autowired
    private com.prestamos.services.ExpedienteDigitalService expedienteDigitalService;

    @Override
    public void run(String... args) {
        if (prestamoRepository.count() == 0) {
            System.out.println("Inicializando datos de prueba en la base de datos SQLite...");

            SolicitudPrestamoDTO prestamo1 = new SolicitudPrestamoDTO();
            prestamo1.setClienteDni("4892145");
            prestamo1.setClienteNombre("Carlos Mendoza Ramos");
            prestamo1.setClienteTelefono("+591 71234567");
            prestamo1.setClienteDireccion("Av. América #450, Cochabamba");
            prestamo1.setClienteEmail("carlos.mendoza@email.com");
            prestamo1.setGaranteNombre("Patricia Soliz Arze");
            prestamo1.setGaranteDni("5928311");
            prestamo1.setMoneda(Moneda.BOB);
            prestamo1.setMonto(new BigDecimal("15000.00"));
            prestamo1.setTasaMensualPct(new BigDecimal("2.50"));
            prestamo1.setPlazoMeses(12);
            prestamo1.setTipoSistema(TipoSistema.FRANCES);
            prestamo1.setFechaInicio(LocalDate.now().minusMonths(2));
            prestamoService.crearPrestamo(prestamo1);

            SolicitudPrestamoDTO prestamo2 = new SolicitudPrestamoDTO();
            prestamo2.setClienteDni("9823412");
            prestamo2.setClienteNombre("María Elena Morales");
            prestamo2.setClienteTelefono("+591 76543210");
            prestamo2.setClienteDireccion("Calle Ballivián #120, Santa Cruz");
            prestamo2.setClienteEmail("maria.morales@email.com");
            prestamo2.setGaranteNombre("Roberto Gómez Valda");
            prestamo2.setGaranteDni("3419082");
            prestamo2.setMoneda(Moneda.EUR);
            prestamo2.setMonto(new BigDecimal("3000.00"));
            prestamo2.setTasaMensualPct(new BigDecimal("1.80"));
            prestamo2.setPlazoMeses(6);
            prestamo2.setTipoSistema(TipoSistema.ALEMAN);
            prestamo2.setFechaInicio(LocalDate.now().minusMonths(1));
            prestamoService.crearPrestamo(prestamo2);

            System.out.println("Datos de prueba cargados exitosamente.");
        }

        // Crear prestamo de ejemplo de Mirian Alvarado Cerezo si no existe
        if (clienteRepository.findByDni("61408887Z").isEmpty()) {
            System.out.println("Registrando caso de estudio: Mirian Alvarado Cerezo (Barcelona)...");
            SolicitudPrestamoDTO prestamoMirian = new SolicitudPrestamoDTO();
            prestamoMirian.setClienteDni("61408887Z");
            prestamoMirian.setClienteNombre("Mirian Alvarado Cerezo");
            prestamoMirian.setClienteTelefono("+34 612 345 678");
            prestamoMirian.setClienteDireccion("C. de Francesc Moragas 91 P01 1 Santa Coloma de Gramanet Barcelona");
            prestamoMirian.setClienteEmail("mirian.alvarado@email.es");
            prestamoMirian.setMoneda(Moneda.EUR);
            prestamoMirian.setMonto(new BigDecimal("5000.00"));
            prestamoMirian.setTasaMensualPct(new BigDecimal("6.00"));
            prestamoMirian.setPlazoMeses(14);
            prestamoMirian.setTipoSistema(TipoSistema.FRANCES);
            prestamoMirian.setFechaInicio(LocalDate.of(2026, 8, 6));
            prestamoService.crearPrestamo(prestamoMirian);
        }

        // Sincronizar siempre expedientes en el Escritorio al arrancar
        expedienteDigitalService.sincronizarTodo();
    }
}
