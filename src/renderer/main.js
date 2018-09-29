import { webFrame, remote } from 'electron';
import Vue from 'vue';

import '@/common/main.less';
import { initDot } from 'common/core/path-helpers';
import Application from '@/common/application';

import App from './app';
import router from './router';

// 禁止缩放
webFrame.setZoomLevelLimits(1, 1);

document.registerElement('imark-styles');
document.registerElement('imark-app');
document.registerElement('imark-toolbar');
document.registerElement('imark-workspace');

document.body.classList.add(`platform-${process.platform}`);

initDot(remote.app.getPath('home'));

// 阻止浏览器默认行为
document.addEventListener('keydown', (e) => {
  if (e.keyCode === 8) {
    e.preventDefault();
  }
});

document.addEventListener('dragleave', e => e.preventDefault(), false);
document.addEventListener('drop', e => e.preventDefault(), false);
document.addEventListener('dragenter', e => e.preventDefault(), false);
document.addEventListener('dragover', e => e.preventDefault(), false);

window.__application = new Application(process.env.APPLICATION_HOME);

Vue.config.productionTip = false;

export default __application.initialize().then(() => {
  new Vue({
    components: { App },
    router,
    template: '<App/>',
  }).$mount('imark-app');
});
