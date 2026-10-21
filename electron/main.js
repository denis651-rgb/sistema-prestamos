const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const http = require('http');

let mainWindow;
let springBootProcess = null;

// Ubicación del archivo JAR empaquetado o en desarrollo
const JAR_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'backend.jar')
  : path.join(__dirname, '../backend/target/prestamos-backend-1.0.0.jar');

function startSpringBoot() {
  console.log('Iniciando subproceso Spring Boot...');
  console.log('Ruta JAR:', JAR_PATH);

  springBootProcess = spawn('java', ['-jar', JAR_PATH], {
    detached: false,
    stdio: 'ignore'
  });

  springBootProcess.on('error', (err) => {
    console.error('Error al arrancar Java Spring Boot:', err);
  });

  springBootProcess.on('exit', (code, signal) => {
    console.log(`Spring Boot finalizó con código ${code} y señal ${signal}`);
  });
}

function checkBackendReady(retries = 30, delay = 1000) {
  return new Promise((resolve, reject) => {
    const attempt = (remaining) => {
      http.get('http://127.0.0.1:8080/actuator/health', (res) => {
        if (res.statusCode === 200) {
          console.log('Spring Boot backend está LISTO y respondiendo (200 OK)');
          resolve(true);
        } else {
          retry(remaining);
        }
      }).on('error', () => {
        retry(remaining);
      });
    };

    const retry = (remaining) => {
      if (remaining <= 0) {
        reject(new Error('Tiempo de espera agotado: Spring Boot no respondió en el puerto 8080.'));
      } else {
        setTimeout(() => attempt(remaining - 1), delay);
      }
    };

    attempt(retries);
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'CrediCore Desktop - Sistema de Créditos y Cobranzas',
    backgroundColor: '#0f172a',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const devUrl = 'http://localhost:5173';
  if (!app.isPackaged) {
    // Modo Desarrollo: intentar conectar con Vite dev server
    mainWindow.loadURL(devUrl).catch(() => {
      console.log('Vite no detectado en localhost:5173, cargando frontend/dist...');
      mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
  } else {
    // Modo Producción: cargar los assets compilados
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
}

// Canales IPC de impresión nativa
ipcMain.handle('print-to-pdf', async (event, options) => {
  if (!mainWindow) return null;
  return await mainWindow.webContents.printToPDF(options || {});
});


ipcMain.handle('open-path', async (event, folderPath) => {
  try {
    if (folderPath) {
      await shell.openPath(folderPath);
      return { success: true, ruta: folderPath };
    }
    const desktopPath = app.getPath('desktop');
    const expedientes = path.join(desktopPath, 'Expedientes_Clientes');
    await shell.openPath(expedientes);
    return { success: true, ruta: expedientes };
  } catch (err) {
    console.error('Error en open-path:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('print-ticket', async () => {
  if (!mainWindow) return;
  mainWindow.webContents.print({
    silent: false,
    printBackground: true,
    pageSize: { width: 80000, height: 297000 } // 80mm
  });
});

app.whenReady().then(async () => {
  if (app.isPackaged) {
    startSpringBoot();
    try {
      await checkBackendReady();
    } catch (e) {
      console.error(e.message);
    }
  }
  createWindow();
});

// Limpieza de procesos huérfanos al cerrar la aplicación
function killBackendProcess() {
  if (springBootProcess) {
    try {
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${springBootProcess.pid} /T /F`, (err) => {
          if (err) console.error('Error terminando proceso Java en Windows:', err);
        });
      } else {
        springBootProcess.kill('SIGINT');
      }
    } catch (e) {
      console.error(e);
    }
    springBootProcess = null;
  }
}

app.on('before-quit', () => {
  killBackendProcess();
});

app.on('window-all-closed', () => {
  killBackendProcess();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
