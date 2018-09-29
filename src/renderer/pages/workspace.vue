<template>
  <imark-workspace>
    <toolbar></toolbar>
    <div class="main" v-if="loaded">
      <sidebar></sidebar>
      <list></list>
      <container></container>
      <sash
        :value="layout.sidebar.width"
        :min-value="160" :max-value="300"
        @on-change="sidebarChange" v-if="layout.sidebar.show">
      </sash>
      <sash
        :value="layout.list.width" :start-value="layout.sidebar.width"
        :min-value="160" :max-value="300"
        @on-change="listChange" v-if="layout.list.show">
      </sash>
    </div>
  </imark-workspace>
</template>

<script>
import { remote } from 'electron';
import { access } from 'common/core/fs-extra';
import layout from '@/store/layout';
import folders from '@/store/folders';
import docs from '@/store/docs';
import Sash from '@/components/common/sash';
import Toolbar from '@/components/common/toolbar';
import Sidebar from '@/components/workspace/sidebar';
import List from '@/components/workspace/list';
import Container from '@/components/workspace/container';

export default {
  name: 'workspace',
  components: {
    Sash,
    Toolbar,
    Sidebar,
    List,
    Container,
  },
  data() {
    return {
      layout: layout.state,
      loaded: false,
    };
  },
  created() {
    const loadingInstance = __application.utils.loading('初始化资源库...');
    const path = __application.config.get('base.path');
    setTimeout(() => {
      if (!path || !access(path)) {
        loadingInstance.close();
        setTimeout(() => {
          remote.dialog.showErrorBox('找不到 iMark 资源库文件', '选择的路径中找不到 iMark 的资源库文件，请确定你选择的路径是否正确。');
          this.$router.push('/initialize');
        }, 400);
      } else {
        this.initialize();
        Promise.all([
          folders.initialize(path),
          docs.initialize(path),
        ]).then(() => {
          this.loaded = true;
          loadingInstance.close();
        });
      }
    }, 600);
  },
  mounted() {
    this.$el.addEventListener('workspace:toggle-sidebar', this.sidebarToggle);
    this.$el.addEventListener('workspace:toggle-list', this.listToggle);
    this.$el.addEventListener('workspace:toggle-edit', this.editToggle);
  },
  methods: {
    sidebarToggle() {
      layout.sidebarToggle();
    },
    sidebarChange(value) {
      layout.sidebarChange(value);
    },
    listToggle() {
      layout.listToggle();
    },
    listChange(value) {
      layout.listChange(value);
    },
    editToggle() {
      layout.editToggle();
    },
    initialize() {
      __application.menus.initializeApplicationMenu();
      __application.menus.initializeContextMenu();
      __application.menus.registerDefaultTarget('imark-workspace');
    },
  },
};
</script>


<style lang="less">
imark-workspace {
  display: block;
  height: 100%;
  width: 100%;

  .main {
    position: absolute;
    top: 38px;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: hidden;

    .placeholder {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
      color: #999;
      font-size: 28px;
    }
  }

  .dragging {
    cursor: ew-resize;
  }
}
</style>
