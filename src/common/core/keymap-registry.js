import fs from 'fs-extra';
import mousetrap from 'mousetrap';

export default class KeymapRegistry {
  constructor(configFilePath, commands) {
    this.keymaps = {};
    this.keystrokes = [];

    this.configFilePath = configFilePath;
    this.commands = commands;
  }

  async initialize() {
    if (!this.initialized) {
      this.initialized = true;
      this.keymaps = fs.readJsonSync(this.configFilePath, { throws: false });
      this.loadKeymap(this.keymaps);
    }
  }

  update(unbindKeymaps = []) {
    mousetrap.reset();
    this.keystrokes.forEach((binding) => {
      if (unbindKeymaps.indexOf(binding.keymap) === -1) {
        mousetrap.bind(binding.keymap, () => {
          this.commands.dispatch(binding.target, binding.command);
        });
      }
    });
  }

  getKeystrokesByCommand() {
    const unsetKeystrokes = new Set();
    this.keystrokes.forEach((binding) => {
      if (binding.command === 'unset!') {
        unsetKeystrokes.add(binding.keymap);
      }
    });

    const keystrokesByCommand = {};
    this.keystrokes.every((binding) => {
      if (unsetKeystrokes.has(binding.keymap)) { return true; }
      if (binding.keymap.includes(' ')) { return true; }
      if (keystrokesByCommand[binding.command] == null) {
        keystrokesByCommand[binding.command] = {
          keymaps: [],
          target: binding.target,
        };
      }
      keystrokesByCommand[binding.command].keymaps.unshift(binding.keymap);
      return true;
    });
    return keystrokesByCommand;
  }

  loadKeymap(keymaps) {
    Object.keys(keymaps).forEach((target) => {
      Object.keys(keymaps[target]).forEach((keymap) => {
        this.keystrokes.push({ command: keymaps[target][keymap], keymap, target });
      });
    });
    this.update();
  }
}
