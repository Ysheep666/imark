/* eslint no-eval: 0, no-useless-call: 0 */
/**
 * 扩展管理器
 */
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import fsExtra from 'fs-extra';
import { accessPath } from './fs-extra';

// 获取文件内容
const readFile = (filepath) => {
  try {
    return fs.readFileSync(filepath, 'utf-8');
  } catch (e) {
    return '';
  }
};

export default class PackageRegistry {
  constructor(resourcePath, config) {
    this.packages = [];
    this.themes = [];
    this.previewThemes = [];
    this.resourcePath = resourcePath;
    this.config = config;
  }

  async initialize() {
    if (!this.initialized) {
      this.initialized = true;
      const deactivatedPackages = this.config.get('packages.deactivated') || [];
      fs.readdirSync(this.resourcePath).forEach((directory) => {
        const packagePath = path.join(this.resourcePath, directory);
        const stats = fs.statSync(packagePath);
        // 包是否存在
        if (stats.isDirectory() && accessPath(path.join(packagePath, 'package.json'))) {
          const metadata = fsExtra.readJsonSync(path.join(packagePath, 'package.json'));

          // 是否禁用
          if (metadata && deactivatedPackages.indexOf(metadata.name) === -1) {
            const { theme } = metadata;
            if (theme) {
              if (theme.main && theme.main.length) {
                theme.main.forEach((item) => {
                  this.themes.push({
                    name: item.name,
                    filepath: path.join(packagePath, item.file),
                  });
                });
              }

              if (theme.preview && theme.preview.length) {
                theme.preview.forEach((item) => {
                  this.previewThemes.push({
                    name: item.name,
                    filepath: path.join(packagePath, item.file),
                  });
                });
              }
            } else {
              this.packages.push({
                name: metadata.name,
                filepath: path.join(packagePath, metadata.main),
              });
            }
          }
        }
      });
    }
  }

  runQueues(application) {
    return Promise.all(this.packages.map(extension => new Promise((resolve, reject) => {
      let module;
      try {
        const content = readFile(extension.filepath);
        module = content ? window.eval(content) : null;
      } catch (e) {
        return reject(e);
      }

      if (!module.install) {
        module.install = (application, callbacl) => {
          callbacl();
        };
      }

      return module.install(application, () => {
        resolve();
      });
    })));
  }

  setTheme() {
    const styleDom = document.getElementsByTagName('imark-styles')[0];
    const config = this.config.get('packages.theme') || { name: 'default' };
    const { filepath } = _.find(this.themes, { name: config.name }) || {};
    if (filepath) {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = readFile(filepath) || '';
      styleDom.appendChild(style);
      return new Promise((resolve) => {
        style.onload = style.onreadystatechange = () => {
          resolve();
        };
      });
    }
    return Promise.resolve();
  }

  setPreviewTheme() {
    const styleDom = document.getElementsByTagName('imark-styles')[0];
    const config = this.config.get('packages.previewTheme') || { name: 'default' };
    const { filepath } = _.find(this.previewThemes, { name: config.name }) || {};
    if (filepath) {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = readFile(filepath) || '';
      styleDom.appendChild(style);
      return new Promise((resolve) => {
        style.onload = style.onreadystatechange = () => {
          resolve();
        };
      });
    }
    return Promise.resolve();
  }
}
