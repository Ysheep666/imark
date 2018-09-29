import path from 'path';
import { app } from 'electron';

import { initDot } from '../common/core/path-helpers';
import { access } from '../common/core/fs-extra';
import Application from './application';

/**
 * Set `process.env.STATIC_PATH` 和 `process.env.URL_PREFIX`
 */
if (process.env.NODE_ENV !== 'development') {
  process.env.STATIC_PATH = path.join(__dirname, '/static').replace(/\\/g, '\\\\');
  process.env.URL_PREFIX = `file://${__dirname}`;
} else {
  process.env.STATIC_PATH = process.env.DEVELOPMENT_STATIC_PATH;
  process.env.URL_PREFIX = 'http://localhost:9080';
}

initDot(app.getPath('home'));

let mainWindow;
let mainWindowIsClose = false;

const createMainWindow = () => {
  global.__application = new Application();
  __application.initialize();

  const path = __application.config.get('base.path');
  if (path && access(path)) {
    mainWindow = __application.createWindow('workspace');
  } else {
    mainWindow = __application.createWindow('initialize');
  }

  mainWindow.on('close', (event) => {
    if (process.platform !== 'win32' && !mainWindowIsClose) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  console.log('MainWindow opened');
};


app.on('ready', () => {
  createMainWindow();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  } else {
    mainWindow.show();
  }
});

app.on('before-quit', () => {
  mainWindowIsClose = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
