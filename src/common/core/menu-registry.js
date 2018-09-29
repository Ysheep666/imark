import { ipcRenderer } from 'electron';
import fs from 'fs-extra';
import _ from 'lodash';

export default class MenuRegistry {
  constructor(configFilePath, keymaps) {
    this.template = [];
    this.contextTemplatesSets = {};
    this.pendingUpdateOperation = null;

    this.configFilePath = configFilePath;
    this.keymaps = keymaps;
  }

  async initialize() {
    if (!this.initialized) {
      this.initialized = true;
      this.data = fs.readJsonSync(this.configFilePath, { throws: false });
    }
  }

  initializeApplicationMenu() {
    this.isInitializedApplicationMenu = true;
    this.add(this.data.menu);
  }

  initializeContextMenu() {
    this.addContext(this.data['context-menu']);
  }

  registerDefaultTarget(target) {
    this.rootTarget = target;
    if (this.isInitializedApplicationMenu) {
      this.update();
    }
  }

  add(items) {
    items = _.cloneDeep(items);
    items.forEach((item) => {
      this.merge(this.template, item);
    });
    this.update();
  }

  addContext(itemsBySelector) {
    itemsBySelector = _.cloneDeep(itemsBySelector);
    Object.keys(itemsBySelector).forEach((selector) => {
      const items = itemsBySelector[selector];
      if (!this.contextTemplatesSets[selector]) {
        this.contextTemplatesSets[selector] = [];
      }

      items.forEach((item) => {
        this.merge(this.contextTemplatesSets[selector], item);
      });
    });
  }

  openContextMenu(selector, target, options = {}) {
    if (!selector || !this.contextTemplatesSets[selector]) {
      return false;
    }
    return ipcRenderer.send('context-menu', target, this.contextTemplatesSets[selector], this.keymaps.getKeystrokesByCommand(), options);
  }

  // Refreshes the currently visible menu.
  update() {
    if (!this.initialized) {
      return;
    }

    if (this.pendingUpdateOperation != null) {
      clearImmediate(this.pendingUpdateOperation);
    }

    this.pendingUpdateOperation = setImmediate(() => {
      this.sendToBrowserProcess(this.template, this.keymaps.getKeystrokesByCommand());
    });
  }

  merge(menu, item) {
    item = this.cloneMenuItem(item);
    const matchingItemIndex = this.findMatchingItemIndex(menu, item);
    const matchingItem = matchingItemIndex !== -1 ? menu[matchingItemIndex] : null;

    if (matchingItem != null) {
      if (item.submenu != null) {
        item.submenu.forEach((submenuItem) => {
          this.merge(matchingItem.submenu, submenuItem);
        });
      }
    } else if (item.type !== 'separator' || _.last(menu).type !== 'separator') {
      menu.push(item);
    }
  }

  cloneMenuItem(item) {
    item = _.pick(item, 'type', 'label', 'position', 'enabled', 'visible', 'command', 'submenu', 'commandDetail', 'role');
    if (item.submenu != null) {
      item.submenu = item.submenu.map(submenuItem => this.cloneMenuItem(submenuItem));
    }
    return item;
  }

  findMatchingItemIndex(menu, { type, label, submenu }) {
    if (type === 'separator') { return -1; }
    return _.indexOf(menu, (item) => {
      const isEquals = this.normalizeLabel(item.label) === this.normalizeLabel(label);
      return isEquals && (item.submenu != null) === (submenu != null);
    });
  }

  normalizeLabel(label) {
    if (label == null) { return undefined; }

    if (process.platform === 'darwin') {
      return label;
    }
    return label.replace(/&/g, '');
  }

  sendToBrowserProcess(template, keystrokesByCommand) {
    return ipcRenderer.send('update-application-menu', this.rootTarget, template, keystrokesByCommand);
  }
}
