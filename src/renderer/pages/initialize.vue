<template>
  <div class="page-initialize">
    <imark-toolbar class="simple">
      <window-controls></window-controls>
    </imark-toolbar>
    <div class="main">
      <div class="content">
        <div>
          <h1>创建你的资源库</h1>
          <div>
            <button class="btn btn-primary create" @click="openCreate">创建新资源库</button>
            <button class="btn btn-default" @click="importProject">导入电脑上的资源库</button>
          </div>
        </div>
      </div>
      <v-dialog :visible.sync="create.show">
        <form class="panel create" @submit.prevent="createProject">
          <div class="panel-header">创建资源库</div>
          <div class="panel-content">
            <p>请输入资源库的名称（例：我的日志、团队共用等），点击确认后选择资源库存放路径。</p>
            <input ref="createInput" type="text" v-model="create.name"/>
          </div>
          <div class="panel-footer">
            <button type="submit" class="btn btn-primary">确定</button>
            <button type="button" class="btn btn-default cancel" @click="create.show = false">取消</button>
          </div>
        </form>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import { remote } from 'electron';
import { init, access } from 'common/core/fs-extra';
import WindowControls from '@/components/common/window-controls';
import Dialog from '@/components/common/dialog';

const openDirectory = name => __application.utils.openDialog({
  properties: ['openDirectory'],
}).then((files) => {
  if (!files || !files.length) {
    return null;
  }

  let path = files[0];
  if (name) {
    path += `/${name}`;
  }
  return path;
});

export default {
  name: 'initialize',
  components: {
    WindowControls,
    VDialog: Dialog,
  },
  data() {
    return {
      create: {
        name: '',
        show: false,
      },
    };
  },
  created() {
    __application.menus.registerDefaultTarget('.page-initialize');
  },
  methods: {
    openCreate() {
      this.create.name = 'imark';
      this.create.show = true;
      this.$nextTick(() => {
        this.$refs.createInput.select();
      });
    },
    createProject() {
      this.create.show = false;
      setTimeout(() => {
        openDirectory(this.create.name).then((path) => {
          if (!path) {
            return Promise.reject('not path');
          }
          return init(path).then(() => path);
        }).then((path) => {
          __application.config.set('base.path', path);
          this.$router.push('/workspace');
        });
      }, 200);
    },
    importProject() {
      openDirectory().then((path) => {
        if (path && access(path)) {
          __application.config.set('base.path', path);
          this.$router.push('/workspace');
        } else if (path) {
          remote.dialog.showErrorBox('找不到 iMark 资源库文件', '选择的路径中找不到 iMark 的资源库文件，请确定你选择的路径是否正确。');
        }
      });
    },
  },
};
</script>

<style lang="less">
.page-initialize {
  .simple {
    background: transparent;
    border-bottom: none;
    box-shadow: none;
  }

  .main {
    position: absolute;
    top: 38px;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  .content {
    h1, .btn {
      margin: 10px;
    }
  }
}
</style>
