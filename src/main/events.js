import { app, BrowserWindow, Menu } from 'electron';
import { EventEmitter } from 'events';

export default class Events extends EventEmitter {
  handleEvents() {
    // Window
    this.on('window:toggle-dev-tools', (event) => {
      event.focusedWindow.toggleDevTools();
    });

    // Application
    this.on('application:resize', (event) => {
      const focusedWindow = BrowserWindow.fromWebContents(event.sender);
      if (focusedWindow.isMaximized()) {
        focusedWindow.unmaximize();
      } else {
        focusedWindow.maximize();
      }
    });

    this.on('application:fullscreen', (event) => {
      const focusedWindow = BrowserWindow.fromWebContents(event.sender);
      focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
    });

    this.on('application:about', () => Menu.sendActionToFirstResponder('orderFrontStandardAboutPanel:'));
    this.on('application:hide', () => Menu.sendActionToFirstResponder('hide:'));
    this.on('application:hide-other-applications', () => Menu.sendActionToFirstResponder('hideOtherApplications:'));
    this.on('application:unhide-all-applications', () => Menu.sendActionToFirstResponder('unhideAllApplications:'));
    this.on('application:minimize', () => Menu.sendActionToFirstResponder('performMiniaturize:'));
    this.on('application:quit', () => app.quit());
    this.on('application:unhide-all-applications', () => Menu.sendActionToFirstResponder('unhideAllApplications:'));

    // core
    this.on('core:undo', () => Menu.sendActionToFirstResponder('undo:'));
    this.on('core:redo', () => Menu.sendActionToFirstResponder('redo:'));
    this.on('core:cut', () => Menu.sendActionToFirstResponder('cut:'));
    this.on('core:copy', () => Menu.sendActionToFirstResponder('copy:'));
    this.on('core:paste', () => Menu.sendActionToFirstResponder('paste:'));
    this.on('core:select-all', () => Menu.sendActionToFirstResponder('selectAll:'));
  }
}
