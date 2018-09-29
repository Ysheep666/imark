import path from 'path';
import _ from 'lodash';
import { app, BrowserWindow, ipcMain, Menu } from 'electron';

import Config from '../common/core/config';
import Events from './events';

export default class Application extends Events {
  constructor() {
    super();

    this.pages = {};
    this.activeTemplate = [];
    this.unbindKeymaps = [];
    this.config = new Config(path.join(app.getPath('home'), '.imark/config.json'));

    this.handleEvents();
    this.handleIpcMain();
  }

  initialize() {
    this.config.initialize();
    this.pages = require('../common/page.json');
  }

  createWindow(name) {
    const focusedWindow = new BrowserWindow(this.pages[name]);
    focusedWindow.loadURL(`${process.env.URL_PREFIX}/index.html#${name}`);
    return focusedWindow;
  }

  sendCommand(command, args) {
    const commandPrefix = command.split(':')[0];
    if (['core', 'window', 'application'].indexOf(commandPrefix) !== -1) {
      this.emit(command, args);
    } else {
      args.focusedWindow.send('command', { command, target: args.target });
    }
  }

  handleIpcMain() {
    ipcMain.on('command', (event, command) => this.emit(command, event));
    ipcMain.on('update-application-menu', (event, rootTarget, template, keystrokesByCommand) => {
      const focusedWindow = BrowserWindow.fromWebContents(event.sender);
      this.updateApplicationMenu(focusedWindow, rootTarget, template, keystrokesByCommand);
    });

    ipcMain.on('context-menu', (event, rootTarget, template, keystrokesByCommand, options) => {
      const focusedWindow = BrowserWindow.fromWebContents(event.sender);
      this.openContentMenu(focusedWindow, rootTarget, template, keystrokesByCommand, options);
    });
  }

  updateApplicationMenu(focusedWindow, rootTarget, template, keystrokesByCommand) {
    this.unbindKeymaps = [];
    this.translateTemplate(
      focusedWindow, rootTarget, template,
      keystrokesByCommand, this.unbindKeymaps,
    );
    if (!_.isEqual(template, this.activeTemplate)) {
      this.activeTemplate = template;
      const menu = Menu.buildFromTemplate(_.cloneDeep(template));
      Menu.setApplicationMenu(menu);
      focusedWindow.send('update-application-keymap', this.unbindKeymaps);
    }
  }

  openContentMenu(focusedWindow, rootTarget, template, keystrokesByCommand, options) {
    this.translateTemplate(focusedWindow, rootTarget, template, keystrokesByCommand);
    const menu = Menu.buildFromTemplate(_.cloneDeep(template));
    if (options.x && options.y) {
      menu.popup(focusedWindow, options.x, options.y);
    } else {
      menu.popup(focusedWindow);
    }
  }

  // Combines a menu template with the appropriate keystroke.
  //
  // template - An Object conforming to atom-shell's menu api but lacking
  //            accelerator and click properties.
  // keystrokesByCommand - An Object where the keys are commands and the values
  //                       are Arrays containing the keystroke.
  //
  // Returns a complete menu configuration object for atom-shell's menu API.
  translateTemplate(focusedWindow, rootTarget, template, keystrokesByCommand, unbindKeymaps = []) {
    template.forEach((item) => {
      if (!item.metadata) { item.metadata = {}; }
      if (item.command) {
        const target = keystrokesByCommand[item.command] ?
          keystrokesByCommand[item.command].target : rootTarget;
        item.accelerator = keystrokesByCommand[item.command]
          && keystrokesByCommand[item.command].keymaps[0];
        item.click = () => {
          const args = item.args || {};
          args.target = target;
          args.focusedWindow = focusedWindow;
          this.sendCommand(item.command, args);
        };
        if (!/^application:/.test(item.command)) { item.metadata.windowSpecific = true; }
        if (item.accelerator) {
          unbindKeymaps.push(item.accelerator);
        }
      }
      if (item.submenu) {
        this.translateTemplate(
          focusedWindow, rootTarget, item.submenu,
          keystrokesByCommand, unbindKeymaps,
        );
      }
    });
  }
}
