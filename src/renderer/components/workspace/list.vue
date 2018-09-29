<template>
  <div class="list" :style="style">
    <ul @click="select('')" v-if="_docs.length">
      <li class="item" :key="doc._id" :class="{'active': active === doc._id}"
        @click.stop="select(doc)" @contextmenu="openDocOptions(doc)"
        v-for="doc in _docs">
        <div class="state">
          <span class="date">{{doc.distance}}</span>
        </div>
        <div class="content">
          <h1>{{doc.name}}</h1>
          <p>{{doc.summary}}</p>
        </div>
      </li>
    </ul>
    <div class="placeholder" v-else>
      <div>没有文稿</div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import dateFns from 'date-fns';
import zhCnLocale from '@/common/locale/date-fns.zh_cn';
import layout from '@/store/layout';
import docs from '@/store/docs';
import animation from '@/common/mixin/animation';

const SIDEBAR_ACTIVE = 'layout.sidebar.active';
const SIDEBAR_SHOW = 'layout.sidebar.show';
const SIDEBAR_WIDTH = 'layout.sidebar.width';

export default {
  name: 'list',
  mixins: [animation],
  data() {
    return {
      layout: layout.state,
      docs: docs.state,
      left: 0,
      current: { // 当前选择内容
        _id: '',
        name: '',
      },
    };
  },
  computed: {
    style() {
      return {
        left: `${this.left}px`,
        width: `${this.layout.list.width}px`,
      };
    },
    active() {
      return this.layout.list.active || '';
    },
    _docs() {
      return this.docs.items
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((doc) => {
          doc.distance = dateFns.distanceInWords(doc.updatedAt, new Date(), {
            addSuffix: true,
            locale: zhCnLocale,
          });
          return doc;
        });
    },
  },
  watch: {
    [SIDEBAR_ACTIVE]() {
      docs.check();
    },
    [SIDEBAR_SHOW](value) {
      const newLeft = value ? this.layout.sidebar.width : 0;
      this.animation('left', this.left, newLeft);
    },
    [SIDEBAR_WIDTH](value) {
      this.left = value;
    },
    _docs: {
      handler(value) {
        if (value.length === 0) {
          this.select({ _id: '', name: '' });
        } else if (_.findIndex(value, { _id: this.active }) === -1) {
          this.select(value[0]);
        }
      },
      immediate: true,
    },
  },
  created() {
    this.left = this.layout.sidebar.show ? this.layout.sidebar.width : 0;
  },
  mounted() {
    const action = functionName => () => {
      if (this.current._id) {
        this[functionName](this.current);
      }
    };

    this.$el.addEventListener('workspace:trash-doc', action('trashDoc'));
    this.$el.addEventListener('workspace:undo-doc', action('undoDoc'));
    this.$el.addEventListener('workspace:remove-doc', action('removeDoc'));
  },
  methods: {
    select(doc) {
      layout.listActive(doc._id);
      this.current._id = doc._id;
      this.current.name = doc.name;
    },
    openDocOptions(doc) {
      this.select(doc);
      setTimeout(() => {
        const sidebarActive = this.layout.sidebar.active;
        if (sidebarActive === 'trash') {
          __application.menus.openContextMenu('doc-trash-options', 'imark-workspace .main .list');
        } else {
          __application.menus.openContextMenu('doc-options', 'imark-workspace .main .list');
        }
      }, 20);
    },
    trashDoc(doc) {
      const old = _.cloneDeep(doc);
      docs.trash(doc._id).then(() => {
        const h = this.$createElement;
        this.message = __application.utils.message({
          message: h('div', null, [
            h('span', null, `「${old.name}」已移动到废纸篓。`),
            h('a', {
              on: {
                click: () => {
                  docs.trash(old._id, true).then(() => {
                    this.message.close();
                  });
                },
              },
            }, '撤销'),
          ]),
        });
      });
    },
    undoDoc(doc) {
      docs.trash(doc._id, true);
    },
    removeDoc(doc) {
      __application.utils.confirm('永久删除', '永久删除后无法撤销，你确定要删除吗？', () => {
        docs.delete(doc._id);
      });
    },
  },
};
</script>

<style lang="less">
imark-workspace .main {
  .list {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    background: #fff;
    border-left: 1px solid #ddd;
    overflow-y: auto;
    overflow-x: hidden;

    ul {
      margin: 0;
      padding: 0;
    }

    .item {
      list-style: none;
      display: flex;
      align-items: flex-start;
      border-bottom: 1px solid rgba(221, 221, 221, 0.6);
      color: #333;
      background: #fff;

      &.active {
        background: #e7f3ff;
        color: #333;
      }

      .state {
        display: flex;
        margin-left: 5px;
        margin-right: 5px;
        padding: 10px 0;
        width: 40px;
        flex-direction: column;
        align-items: center;

        .date {
          padding-top: 4px;
          line-height: 16px;
          font-size: 12px;
          opacity: .5;
        }
      }

      .content {
        padding: 6px 10px 6px 0;
        flex: 1;
        align-self: center;
        overflow: hidden;
        min-height: 100px;

        h1 {
          margin: 4px 0;
          display: block;
          line-height: 24px;
          font-size: 16px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: left;
        }

        p {
          display: -webkit-box;
          margin: 4px 0;
          line-height: 20px;
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          opacity: .7;
        }
      }
    }
  }
}
</style>
