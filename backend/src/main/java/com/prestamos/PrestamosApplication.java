package com.prestamos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class PrestamosApplication {

    public static void main(String[] args) {
        System.setProperty("java.awt.headless", "false");
        // Asegurar que el directorio de la base de datos SQLite exista en %USERPROFILE%/.prestamos_app
        String userHome = System.getProperty("user.home");
        File appDir = new File(userHome, ".prestamos_app");
        if (!appDir.exists()) {
            boolean created = appDir.mkdirs();
            if (created) {
                System.out.println("Directorio de base de datos creado: " + appDir.getAbsolutePath());
            }
        }

        SpringApplication.run(PrestamosApplication.class, args);
    }
}
