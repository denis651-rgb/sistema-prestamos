# CrediCore Desktop - Sistema de Créditos y Cobranzas

Sistema Monorepo para la administración de créditos, emisión de contratos legales y cobranzas de caja diaria con soporte multidivisa (**BOB - Bolivianos** y **EUR - Euros**), empaquetado en una aplicación de escritorio nativa para Windows con **Electron**, **React + Tailwind CSS**, **Spring Boot 3 (Java 21)** y base de datos embebida **SQLite**.

---

## 1. Arquitectura de la Solución

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ELECTRON DESKTOP CONTAINER                      │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                     MAIN PROCESS (main.js)                     │   │
│   │  • Orquesta el subproceso Java: `java -jar backend.jar`        │   │
│   │  • Gestiona BrowserWindow nativo (1300x850)                    │   │
│   │  • Puente IPC (impresión silenciosa a tickets 80mm / PDF)      │   │
│   │  • Cierra el proceso Spring Boot al salir de la aplicación     │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────▼────────────────────────────────┐   │
│   │                   RENDERER PROCESS (React UI)                  │   │
│   │  • Dashboard de créditos, simulador y caja diaria              │   │
│   │  • Formulario con validación multidivisa (BOB / EUR)           │   │
│   │  • Vistas de Contrato Legal (A4) y Recibo de Caja (80mm)       │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │ HTTP / JSON (Axios / Fetch)        │
│                                   │ http://127.0.0.1:8080/api/v1       │
│   ┌───────────────────────────────▼────────────────────────────────┐   │
│   │                  BACKEND CORE (Spring Boot 3)                  │   │
│   │  • FinancialCalculationEngine (Francés y Alemán con BigDecimal)│   │
│   │  • Spring Data JPA + Hibernate Community Dialects              │   │
│   │  • Endpoints REST: /prestamos, /cuotas, /pagos, /clientes      │   │
│   │  • Migración/Inicialización de esquema SQLite                  │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │ JDBC: jdbc:sqlite:datos_prestamos.db│
│   ┌───────────────────────────────▼────────────────────────────────┐   │
│   │             BASE DE DATOS EMBEBIDA LOCAL (SQLite)              │   │
│   │  • Archivo: %APPDATA%/../.prestamos_app/datos_prestamos.db     │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Estructura de Directorios del Monorepo

```
prestamos-desktop/
├── backend/                             # Core Spring Boot 3 (Java 21)
│   ├── .mvn/wrapper/                    # Wrapper autónomo de Maven
│   ├── mvnw.cmd / mvnw                  # Ejecutables del wrapper
│   ├── pom.xml                          # Dependencias: Web, Data JPA, SQLite, Hibernate Community
│   └── src/
│       └── main/
│           ├── java/com/prestamos/
│           │   ├── config/              # WebConfig (CORS), DataInitializer
│           │   ├── controllers/         # PrestamoController, CuotaController, ClienteController, DashboardController
│           │   ├── dto/                 # SolicitudPrestamoDTO, CuotaCalculadaDTO, PagoResponseDTO, etc.
│           │   ├── entities/            # Cliente, Prestamo, Cuota, Pago, Moneda, TipoSistema
│           │   ├── repositories/        # Interfaces Spring Data JPA
│           │   ├── services/            # EngineFinancieroService (BigDecimal), PrestamoService, PagoService
│           │   └── PrestamosApplication.java
│           └── resources/
│               └── application.properties # Conexión JDBC SQLite en carpeta de usuario
│
├── frontend/                            # Interfaz de Usuario React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/                         # Cliente Axios hacia http://127.0.0.1:8080/api/v1
│   │   ├── components/                  # Navbar, Dashboard, SimuladorModal, DetallePrestamoModal, etc.
│   │   ├── documents/                   # ContratoPrint.tsx (A4) y ReciboPrint.tsx (Ticket 80mm)
│   │   ├── types/                       # Interfaces TypeScript
│   │   ├── App.tsx                      # Orquestador principal
│   │   ├── main.tsx
│   │   └── index.css                    # Tailwind + @media print (ticket 80mm y A4)
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── electron/                            # Contenedor de Escritorio Nativo
│   ├── main.js                          # Control de ventana, subproceso Java y verificación de salud
│   ├── preload.js                       # Exposición segura de APIs de impresión
│   └── package.json                     # Configuración de empaquetado con electron-builder
│
├── dist-bin/                            # Destino del JAR compilado para distribución
├── package.json                         # Scripts de orquestación raíz
└── README.md
```

---

## 3. Instrucciones de Ejecución en Desarrollo

### Paso 1: Instalar dependencias de Node.js
En la raíz del proyecto (`prestamos-desktop/`):
```powershell
npm install
cd frontend && npm install
cd ../electron && npm install
cd ..
```

### Paso 2: Ejecutar Backend y Frontend en simultáneo
Desde la raíz del proyecto:
```powershell
npm run dev
```
Esto levantará:
- **Spring Boot Backend**: en `http://127.0.0.1:8080`
- **Frontend Vite**: en `http://localhost:5173`

### Paso 3: Abrir la ventana de Electron (Opcional en Dev)
En otra terminal:
```powershell
npm run dev:electron
```

---

## 4. Compilación y Empaquetado para Producción (.EXE)

Para generar el instalador distribuible de Windows (.exe):
```powershell
npm run dist
```
Este script realiza automáticamente:
1. Compila el backend Spring Boot: `mvnw clean package` -> `dist-bin/backend.jar`
2. Compila el frontend React: `vite build` -> `frontend/dist/`
3. Empaqueta el ejecutable independiente de Windows con **electron-builder** en `dist-electron/`.

---

## 5. Características Clave

1. **Precisión Bancaria**: Motor financiero implementado con `BigDecimal` y redondeo `RoundingMode.HALF_UP`.
2. **Sistemas de Amortización**:
   - **Sistema Francés**: Cuotas fijas mensuales con amortización progresiva.
   - **Sistema Alemán**: Amortización constante de capital con cuotas decrecientes.
3. **Multidivisa Completa**: Manejo nativo en **Bolivianos (BOB - Bs.)** y **Euros (EUR - €)** con balances y cajas independientes.
4. **Impresión Directa y Automática**:
   - **Contrato Legal (A4)**: Formato carta con cláusulas civiles/mercantiles, identificación de garante y plan de pagos anexo.
   - **Recibo Térmico (80mm)**: Comprobante para impresoras POS con número correlativo (`REC-000001`), desglose de capital, interés y saldo deudor remanente.
