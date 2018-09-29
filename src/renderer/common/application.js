import path from 'path';
import { ipcRenderer } from 'electron';
import CommandRegistry from 'common/core/command-registry';
import Config from 'common/core/config';
import KeymapRegistry from 'common/core/keymap-registry';
import MenuRegistry from 'common/core/menu-registry';
import PackageRegistry from 'common/core/package-registry';
import Editor from './editor';
import Parser from './parser';

import registerDefaultCommands from './register-default-commands';
import utils from './utils';

export default class Application {
  constructor(configDirPath) {
    this.configDirPath = configDirPath;
    this.utils = utils;
    this.commands = new CommandRegistry();
    this.config = new Config(path.join(this.configDirPath, 'config.json'));
    this.keymaps = new KeymapRegistry(path.join(this.configDirPath, 'keymaps.json'), this.commands);
    this.menus = new MenuRegistry(path.join(this.configDirPath, 'menus.json'), this.keymaps);
    this.packages = new PackageRegistry(path.join(this.configDirPath, 'packages'), this.config);

    this.editor = new Editor(this.config);
    this.parser = new Parser(this.config);

    this.handleIpcRenderer();
    this.registerDefaultCommands();
  }

  registerStyles(styles) {
    this.styles = styles;
  }

  async initialize() {
    await this.config.initialize();
    await this.keymaps.initialize();
    await this.menus.initialize();
    await this.packages.initialize();

    await this.parser.initialize();

    await this.packages.setTheme();
    await this.packages.runQueues(this);
  }

  registerDefaultCommands() {
    registerDefaultCommands(this.commands);
  }

  handleIpcRenderer() {
    ipcRenderer.on('command', (event, args) => this.commands.dispatch(args.target, args.command));
    ipcRenderer.on('update-application-keymap', (event, unbindKeymaps) => {
      this.keymaps.update(unbindKeymaps);
    });
  }
}
