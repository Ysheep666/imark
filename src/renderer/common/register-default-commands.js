import { ipcRenderer } from 'electron';

export default (commands) => {
  commands.add(
    'imark-app',
    {
      'application:fullscreen': () => ipcRenderer.send('command', 'application:fullscreen'),
      'application:hide': () => ipcRenderer.send('command', 'application:hide'),
      'application:minimize': () => ipcRenderer.send('command', 'application:minimize'),
      'application:resize': () => ipcRenderer.send('command', 'application:resize'),
    },
  );
};
