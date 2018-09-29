import { remote } from 'electron';
import Vue from 'vue';
import Router from 'vue-router';

import page from 'common/page';

const browserWindow = remote.getCurrentWindow();

Vue.use(Router);

/**
 * 改变窗口
 */
const reset = ({
  width,
  height,
  minWidth = width,
  minHeight = height,
  resizable = false,
}) => {
  setTimeout(() => { // 异步执行
    browserWindow.setResizable(resizable);
    browserWindow.setMinimumSize(minWidth, minHeight);
    browserWindow.setSize(width, height, true);
  }, 50);
};

const getBeforeEnter = options => (to, from, next) => {
  if (from.path !== '/') {
    reset(options);
  }
  next();
};

export default new Router({
  routes: [
    {
      name: 'workspace',
      path: '/workspace',
      component: () => import('@/pages/workspace'),
      beforeEnter: getBeforeEnter(page.workspace),
    },
    {
      name: 'initialize',
      path: '/initialize',
      component: () => import('@/pages/initialize'),
      beforeEnter: getBeforeEnter(page.initialize),
    },
    {
      path: '*',
      redirect: '/workspace',
    },
  ],
});
