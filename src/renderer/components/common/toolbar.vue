<template>
  <imark-toolbar @dblclick="maximize">
    <div class="sidebar" :style="sidebarStyle">
      <window-controls></window-controls>
      <a title="布局" class="btn btn-default btn-dropdown" ref="layout" @click="openLayoutOptions" @dblclick.stop>
        <i class="iconfont icon-buju"></i>
      </a>
    </div>
    <div class="list" :style="{'width': layout.list.width + 'px'}">
      <a title="查找文档" class="btn btn-default">
        <i class="iconfont icon-sousuo"></i>
      </a>
      <a title="新建文档" class="btn btn-default" @click="add" @dblclick.stop>
        <i class="iconfont icon-bianji"></i>
      </a>
    </div>
    <div class="container">
      <a title="发布" class="btn btn-default" ref="publishButton" @click="publish.show = true" @dblclick.stop>
        <i class="iconfont icon-fabu"></i>
      </a>
      <a title="目录" class="btn btn-default"  @click="openToc" @dblclick.stop>
        <i class="iconfont icon-wenzhangmulu"></i>
      </a>
      <a title="详情" class="btn btn-default">
        <i class="iconfont icon-qitaxinxi"></i>
      </a>
      <v-popover :visible.sync="publish.show" reference="publishButton" popperClass="publish-popover">
        <div class="publish-popover-content" @dblclick.stop>
          <a @click="exportAsHtml">
            <div class="file-icon">H</div>
            <div>HTML</div>
          </a>
          <a @click="exportAsPdf">
            <div class="file-icon">P</div>
            <div>PDF</div>
          </a>
          <a @click="exportAsPdf">
            <div class="file-icon">J</div>
            <div>JPG</div>
          </a>
        </div>
      </v-popover>
    </div>
  </imark-toolbar>
</template>

<script>
// import fsExtra from 'fs-extra';
import layout from '@/store/layout';
import docs from '@/store/docs';
import WindowControls from './window-controls';
import Popover from './popover';

export default {
  name: 'toolbar',
  components: {
    WindowControls,
    VPopover: Popover,
  },
  data() {
    return {
      layout: layout.state,
      publish: {
        show: false,
      },
    };
  },
  computed: {
    sidebarStyle() {
      if (!this.layout.sidebar.show) {
        return {
          width: 'auto',
        };
      }

      return {
        width: `${this.layout.sidebar.width}px`,
      };
    },
  },
  methods: {
    maximize() {
      __application.commands.dispatch('imark-app', 'application:resize');
    },
    openLayoutOptions() {
      __application.menus.openContextMenu('layout', 'imark-workspace', {
        x: this.$refs.layout.offsetLeft,
        y: this.$refs.layout.offsetTop + this.$refs.layout.offsetHeight + 5,
      });
    },
    add() {
      docs.create();
    },
    openToc() {
      // const tocs = __application.parser.getTocs(file.state.content);
      // console.log(tocs);
    },
    exportAsHtml() {

    },
    exportAsPdf() {
      // const filename = __application.parser.getTitle(file.state.content) || '未命名';
      // __application.utils.saveDialog({
      //   title: '导出为 PDF...',
      //   defaultPath: filename || '未命名',
      //   filters: [{
      //     name: 'PDF', extensions: ['pdf'],
      //   }],
      // }).then((pathname) => {
      //   if (pathname) {
      //     const loadingInstance = __application.utils.loadingSpinner('正在导出...');
      //     const webview = document.getElementById('webview');
      //     const webContents = webview.getWebContents();
      //     webContents.printToPDF({
      //       marginsType: 0,
      //       pageSize: 'A4',
      //       printBackground: true,
      //     }, (error, data) => {
      //       if (!error) {
      //         fsExtra.outputFile(pathname, data, () => {
      //           setTimeout(() => {
      //             loadingInstance.close();
      //             __application.utils.message(`「${filename}」导出成功。`);
      //           }, 300);
      //         });
      //       }
      //     });
      //   }
      // });
    },
  },
};
</script>

<style lang="less">
imark-toolbar {
  display: flex;
  flex-direction: row;

  .btn {
    margin-right: 10px;
    padding: 0 10px;
    border-radius: 4px;
    line-height: 25px;
    height: 25px;
    color: #777;
    -webkit-app-region: no-drag;

    .iconfont {
      font-size: 13px;
    }
  }

  .sidebar {
    display: flex;
    align-items: center;
    padding-left: 82px;
  }

  .list {
    display: flex;
    align-items: center;
  }

  .container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 1 1 0%;
    padding-right: 10px;
  }
}

.publish-popover {
  width: 294px;

  &-content {
    padding: 0 5px;
    display: flex;
    flex-wrap: wrap;
  }

  .title {
    font-size: 15px;
  }

  a {
    display: block;
    margin: 10px 20px;
    color: #555;
    text-align: center;
    font-size: 12px;

    .file-icon {
      margin-bottom: 5px;
      width: 48px;
      height: 48px;
      border-radius: 3px;
      line-height: 48px;
      font-size: 28px;
      color: #fff;
      background: #FD6464;
    }
  }
}
</style>
