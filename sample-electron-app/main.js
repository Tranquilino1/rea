const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('notes:get-all', async (event, query) => {
  return [
    { id: 1, title: 'Meeting notes', content: 'Discuss REA integration' },
    { id: 2, title: 'Ideas', content: 'Replicate app architecture' }
  ];
});

ipcMain.handle('notes:create', async (event, note) => {
  return { id: 3, ...note, createdAt: Date.now() };
});

ipcMain.on('notes:delete', (event, noteId) => {
  console.log('Deleted note:', noteId);
});
