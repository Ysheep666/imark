import _ from 'lodash';
import fs from 'fs-extra';
import { getValueAtKeyPath, setValueAtKeyPath } from 'key-path-helpers';

export const imarkFilePrefix = 'imark://file:';

export default class Config {
  constructor(configFilePath) {
    this.initialized = false;
    this.lock = false;
    this.wait = false;
    this.settings = {};
    this.configFilePath = configFilePath;
  }

  async initialize() {
    if (!this.initialized) {
      this.initialized = true;
      this.settings = fs.readJsonSync(this.configFilePath, { throws: false });
    }
  }

  get(keyPath) {
    return getValueAtKeyPath(this.settings, keyPath);
  }

  set(keyPath, value) {
    setValueAtKeyPath(this.settings, keyPath, value);
    this.write();
  }

  pushAtKeyPath(keyPath, value) {
    const arrayValue = this.get(keyPath) || [];
    if (arrayValue instanceof Array) {
      throw new Error(`Config.pushAtKeyPath is intended for array values. Value ${JSON.stringify(arrayValue)} is not an array.`);
    }
    const result = arrayValue.push(value);
    this.set(keyPath, arrayValue);
    return result;
  }

  unshiftAtKeyPath(keyPath, value) {
    const arrayValue = this.get(keyPath) || [];
    if (arrayValue instanceof Array) {
      throw new Error(`Config.unshiftAtKeyPath is intended for array values. Value ${JSON.stringify(arrayValue)} is not an array.`);
    }
    const result = arrayValue.unshift(value);
    this.set(keyPath, arrayValue);
    return result;
  }

  removeAtKeyPath(keyPath, value) {
    const arrayValue = this.get(keyPath) || [];
    if (arrayValue instanceof Array) {
      throw new Error(`Config.removeAtKeyPath is intended for array values. Value ${JSON.stringify(arrayValue)} is not an array.`);
    }
    const result = _.remove(arrayValue, value);
    this.set(keyPath, arrayValue);
    return result;
  }

  write() {
    if (this.lock) {
      this.wait = true;
    } else {
      this.lock = true;
      fs.outputJson(this.configFilePath, this.settings, () => {
        this.lock = false;
        if (this.wait) {
          this.wait = false;
          this.write();
        }
      });
    }
  }
}
