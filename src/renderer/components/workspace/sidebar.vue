<template>
  <div class="sidebar" :style="style">
    <nav class="menu">
      <h4>
        资源库
        <a class="open-import-menu" @click="openImportOptions"><i class="iconfont icon-gengduoneirong"></i></a>
      </h4>
      <ul>
        <li v-for="(menu, index) in menus" :key="index">
          <a :class="{'active': !add.is && active === menu.key, 'focus': focus}" @click="selectMenu(menu.key)">
            <i :class="'iconfont ' + menu.icon"></i>{{menu.name}}
          </a>
        </li>
      </ul>
      <h4>
        文件夹（{{folders.items.length}}）
        <a title="新建文件夹" @click="addFolder"><i class="iconfont icon-tianjiawenjianjia"></i></a>
      </h4>
      <ul>
        <li v-for="(folder, index) in folders.items" :key="index">
          <a :class="{'active': !add.is && active === 'folder-' + folder._id, 'focus': focus}"
            @click="selectFolder(folder)"
            @dblclick="renameFolder(folder)"
            @contextmenu="openFolderOptions(folder)">
            <i class="iconfont icon-wenjianjia"></i>
            <span v-if="folder._id !== input._id">{{folder.name}}</span>
            <form class="rename" @submit.prevent="submitRenameFolder(folder)" v-else>
              <input type="text" v-model="input.name" v-focus @blur="submitRenameFolder(folder)"/>
            </form>
          </a>
        </li>
        <li v-if="add.is">
          <a class="active focus">
            <i class="iconfont icon-wenjianjia"></i>
            <form class="rename" @submit.prevent="submitAddFolder">
              <input type="text" v-model="add.name" v-focus @blur="submitAddFolder"/>
            </form>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import _ from 'lodash';
import layout from '@/store/layout';
import folders from '@/store/folders';

export default {
  name: 'sidebar',
  directives: {
    focus: {
      inserted(el) {
        setTimeout(() => el.select(), 0);
      },
    },
  },
  data() {
    return {
      layout: layout.state,
      folders: folders.state,
      menus: [
        { key: 'apps', icon: 'icon-quanbu', name: '全部' },
        { key: 'schedule', icon: 'icon-zuijinqitian', name: '最近 7 天' },
        { key: 'unclassified', icon: 'icon-weiguilei', name: '未归类' },
        { key: 'trash', icon: 'icon-feizhilou', name: '废纸篓' },
      ],
      focus: false,
      current: { // 当前选择内容
        _id: '',
        name: '',
      },
      add: { // 添加文件夹
        is: false,
        name: '',
      },
      input: { // 编辑文件夹
        _id: '',
        name: '',
      },
    };
  },
  computed: {
    style() {
      return {
        width: `${this.layout.sidebar.width}px`,
      };
    },
    active() {
      return this.layout.sidebar.active || 'apps';
    },
  },
  mounted() {
    const action = functionName => () => {
      if (this.focus && this.current._id) {
        this[functionName](this.current);
      }
    };

    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.focus = false;
      }
    });

    this.$el.addEventListener('workspace:rename-folder', action('renameFolder'));
    this.$el.addEventListener('workspace:remove-folder', action('removeFolder'));
  },
  methods: {
    selectMenu(key) {
      layout.sidebarActive(key);
      this.focus = true;
      this.current._id = '';
    },
    selectFolder(folder) {
      layout.sidebarActive(`folder-${folder._id}`);
      this.focus = true;
      this.current._id = folder._id;
      this.current.name = folder.name;
    },
    openImportOptions() {
      __application.menus.openContextMenu('import', 'imark-workspace .main .sidebar');
    },
    // 添加文件夹
    addFolder() {
      this.add.is = true;
      this.add.name = '';
    },
    // 提交添加文件夹
    submitAddFolder() {
      if (this.add.is) {
        folders.create(this.add.name).then((folder) => {
          this.selectFolder(folder);
          this.add.is = false;
        });
      }
    },
    // 重命名文件夹
    renameFolder(folder) {
      this.selectFolder(folder);
      this.input._id = folder._id;
      this.input.name = folder.name;
    },
    // 提交重命名文件夹
    submitRenameFolder(folder) {
      const old = _.cloneDeep(folder);
      if (!this.input._id || !this.input.name || this.input.name === old.name) {
        this.input._id = '';
      } else {
        folders.rename(this.input._id, this.input.name).then(() => {
          const h = this.$createElement;
          this.message = __application.utils.message({
            message: h('div', null, [
              h('span', null, `「${old.name}」已重新命名为「${this.input.name}」。`),
              h('a', {
                on: {
                  click: () => {
                    folders.rename(old._id, old.name).then(() => {
                      this.message.close();
                    });
                  },
                },
              }, '撤销'),
            ]),
          });
          this.input._id = '';
        });
      }
    },
    removeFolder(folder) {
      __application.utils.confirm('删除文件夹', '删除文件夹后无法撤销，你确定要删除吗？', () => {
        folders.delete(folder._id);
      });
    },
    // 打开文件夹选项
    openFolderOptions(folder) {
      this.focus = true;
      this.selectFolder(folder);
      setTimeout(() => {
        __application.menus.openContextMenu('folder-options', 'imark-workspace .main .sidebar');
      }, 100);
    },
  },
};
</script>

<style lang="less">
imark-workspace .main {
  .sidebar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    background: #f5f5f4;

    h4 {
      position: relative;
      margin: 10px 0 5px;
      padding: 5px 10px;
      font-size: 13px;
      font-weight: 500;
      color: #666;

      a {
        position: absolute;
        right: 0;;
        color: #9c9c9c;
        padding: 0 10px;

        .iconfont {
          font-size: 12px;
        }
      }
    }

    ul {
      margin: 0;
      padding: 0;

      > li {
        padding: 0;
        list-style: none;

        a {
          position: relative;
          display: block;
          padding: 0 12px 0 45px;
          font-size: 14px;
          line-height: 32px;
          height: 32px;
          width: 100%;
          color: #777;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-decoration: none;

          &.active {
            background: #555;
            color: #fff;

            &.focus {
              background: #0071fa;
            }
          }
        }

        .iconfont {
          position: absolute;
          display: block;
          left: 22px;
          top: 50%;
          font-size: 15px;
          transform: translateY(-50%);
        }
      }
    }

    form.rename {
      display: block;

      input {
        margin-top: 4px;
        margin-left: -4px;
        padding-left: 4px;
        padding-right: 4px;
        height: 24px;
        line-height: 24px;
        font-size: 14px;
        border: none;
        border-radius: 1px;
      }
    }
  }
}
</style>
