const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('notesApi', {
  getAll: (query) => ipcRenderer.invoke('notes:get-all', query),
  create: (note) => ipcRenderer.invoke('notes:create', note),
  delete: (noteId) => ipcRenderer.send('notes:delete', noteId)
});
