import { ipcRenderer, remote } from 'electron';
import path from 'path';
import DiffDOM from 'diff-dom';

import '@/common/perview.less';
import { initDot } from 'common/core/path-helpers';
import Config from 'common/core/config';
import PackageRegistry from 'common/core/package-registry';
import Parser from '@/common/parser';

process.env.VIEW = 'preview';

document.registerElement('imark-styles');
document.body.classList.add(`platform-${process.platform}`);

initDot(remote.app.getPath('home'));

// 阻止浏览器默认行为
document.addEventListener('dragleave', e => e.preventDefault(), false);
document.addEventListener('drop', e => e.preventDefault(), false);
document.addEventListener('dragenter', e => e.preventDefault(), false);
document.addEventListener('dragover', e => e.preventDefault(), false);

document.addEventListener('click', (e) => {
  e.preventDefault();
  for (let i = 0; i < e.path.length; i += 1) {
    const element = e.path[i];
    if (element.tagName === 'A') {
      remote.shell.openExternal(element.href);
      return;
    }
  }
}, false);


window.__application = {};
__application.config = new Config(path.join(process.env.APPLICATION_HOME, 'config.json'));
__application.packages = new PackageRegistry(path.join(process.env.APPLICATION_HOME, 'packages'), __application.config);
__application.parser = new Parser(__application.config);

const initialize = async () => {
  await __application.config.initialize();
  await __application.packages.initialize();

  await __application.parser.initialize();

  await __application.packages.setPreviewTheme();
  await __application.packages.runQueues(this);
};

export default initialize().then(() => {
  const warpDom = document.getElementsByTagName('div')[0];
  const previewDom = document.createElement('div');
  previewDom.className = 'preview';
  const dd = new DiffDOM();

  ipcRenderer.on('content', (event, value) => {
    previewDom.innerHTML = value ? __application.parser.getHtml(value) : '';
    dd.apply(warpDom, dd.diff(warpDom, previewDom));
  });
});
