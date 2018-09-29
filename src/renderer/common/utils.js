import { remote } from 'electron';
import Vue from 'vue';
import { isVNode } from './vdom';

/**
 * 深层数据结构中取值
 * @param  {Array} p keys
 * @param  {Data} o 取值对象
 * @return
 */
export const getDeepValue = (p, o) => p.reduce((xs, x) => ((xs && xs[x]) ? xs[x] : null), o);

/**
 * 打开文件夹
 */
export const openDialog = (options = {}) => new Promise((resolve) => {
  remote.dialog.showOpenDialog(options, (files) => {
    resolve(files);
  });
});


/**
 * 保存文件
 */
export const saveDialog = (options = {}) => new Promise((resolve) => {
  remote.dialog.showSaveDialog(options, (files) => {
    resolve(files);
  });
});


const LoadingConstructor = Vue.extend(require('./ui/loading'));
export const loading = (options) => {
  options = options || {};
  if (typeof options === 'string') {
    options = {
      message: options,
    };
  }

  const instance = new LoadingConstructor({
    data: options,
  });

  if (isVNode(instance.message)) {
    instance.$slots.default = [instance.message];
    instance.message = null;
  }

  instance.vm = instance.$mount();
  document.body.appendChild(instance.vm.$el);
  instance.vm.show = true;
  return instance.vm;
};


const LoadingSpinnerConstructor = Vue.extend(require('./ui/loading-spinner'));
export const loadingSpinner = (options) => {
  options = options || {};
  if (typeof options === 'string') {
    options = {
      message: options,
    };
  }

  const instance = new LoadingSpinnerConstructor({
    data: options,
  });

  if (isVNode(instance.message)) {
    instance.$slots.default = [instance.message];
    instance.message = null;
  }

  instance.vm = instance.$mount();
  document.body.appendChild(instance.vm.$el);
  instance.vm.show = true;
  return instance.vm;
};


const MessageConstructor = Vue.extend(require('./ui/message'));
export const message = (options) => {
  options = options || {};
  if (typeof options === 'string') {
    options = {
      message: options,
    };
  }

  const instance = new MessageConstructor({
    data: options,
  });

  if (isVNode(instance.message)) {
    instance.$slots.default = [instance.message];
    instance.message = null;
  }

  instance.vm = instance.$mount();
  document.body.appendChild(instance.vm.$el);
  instance.vm.show = true;
  return instance.vm;
};

const DialogConstructor = Vue.extend(require('./ui/dialog'));
export const alert = (title, content, callback) => {
  const instance = new DialogConstructor({
    data: {
      title,
      content,
      ok: '确定',
      onOk: callback,
      cancel: '',
      onCancel: () => { },
    },
  });

  if (isVNode(instance.content)) {
    instance.$slots.default = [instance.content];
    instance.content = null;
  }

  instance.vm = instance.$mount();
  document.body.appendChild(instance.vm.$el);
  instance.vm.show = true;
  return instance.vm;
};

export const confirm = (title, content, callback) => {
  const instance = new DialogConstructor({
    data: {
      title,
      content,
      ok: '确定',
      onOk: callback,
      cancel: '取消',
      onCancel: () => { },
    },
  });

  if (isVNode(instance.content)) {
    instance.$slots.default = [instance.content];
    instance.content = null;
  }

  instance.vm = instance.$mount();
  document.body.appendChild(instance.vm.$el);
  instance.vm.show = true;
  return instance.vm;
};

export default {
  getDeepValue,
  openDialog,
  saveDialog,
  loading,
  loadingSpinner,
  message,
  alert,
  confirm,
};
