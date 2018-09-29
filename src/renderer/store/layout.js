/**
 * 布局信息
 */

export default {
  state: __application.config.get('layout'),
  sidebarActive(key) {
    this.state.sidebar.active = key;
    __application.config.set('layout.sidebar.active', key);
  },
  sidebarToggle() {
    const value = !this.state.sidebar.show;
    if (!this.state.list.show) {
      this.state.list.show = true;
      __application.config.set('layout.list.show', true);
    }
    this.state.sidebar.show = value;
    __application.config.set('layout.sidebar.show', value);
  },
  sidebarChange(value) {
    this.state.sidebar.width = value;
    __application.config.set('layout.sidebar.width', value);
  },
  listActive(key) {
    this.state.list.active = key;
    __application.config.set('layout.list.active', key);
  },
  listToggle() {
    if (this.state.sidebar.show) {
      this.state.sidebar.show = false;
      __application.config.set('layout.sidebar.show', false);
    } else {
      const value = !this.state.list.show;
      this.state.list.show = value;
      __application.config.set('layout.list.show', value);
    }
  },
  listChange(value) {
    this.state.list.width = value;
    __application.config.set('layout.list.width', value);
  },
  editToggle() {
    const value = !this.state.sidebar.show && !this.state.list.show;
    this.state.sidebar.show = value;
    this.state.list.show = value;
    __application.config.set('layout.sidebar.show', value);
    __application.config.set('layout.list.show', value);
  },
  previewToggle() {
    const value = !this.state.preview.show;
    this.state.preview.show = value;
    __application.config.set('layout.preview.show', value);
  },
};
