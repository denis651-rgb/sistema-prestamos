const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printToPDF: (options) => ipcRenderer.invoke('print-to-pdf', options),
  printTicket: () => ipcRenderer.invoke('print-ticket'),
  openPath: (folderPath) => ipcRenderer.invoke('open-path', folderPath),
  isElectron: true,
  platform: process.platform
});
