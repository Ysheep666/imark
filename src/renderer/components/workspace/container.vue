<template>
  <div class="container" :style="style">
    <div class="content" :class="{'open': active}">
      <div class="edit" :class="{'is-preview': preview}" v-if="layout.sidebar.active !== 'trash'">
        <editor ref="editor" @change="editorChange"></editor>
      </div>
      <div class="preview" :class="{'show': preview}">
        <webview id="webview" ref="webview" autosize="on" blinkFeatures="CSSVariables" nodeintegration :src="url_prefix + '/preview.html'"></webview>
      </div>
    </div>
    <div class="placeholder" v-if="!active">
      <div>没有已选的文稿</div>
    </div>
  </div>
</template>

<script>
import layout from '@/store/layout';
import docs from '@/store/docs';
import animation from '@/common/mixin/animation';
import Editor from '@/components/common/editor';

const SIDEBAR_SHOW = 'layout.sidebar.show';
const SIDEBAR_WIDTH = 'layout.sidebar.width';
const LIST_SHOW = 'layout.list.show';
const LIST_WIDTH = 'layout.list.width';

export default {
  name: 'container',
  mixins: [animation],
  components: {
    Editor,
  },
  data() {
    return {
      url_prefix: process.env.URL_PREFIX,
      layout: layout.state,
      left: 0,
    };
  },
  computed: {
    style() {
      return {
        left: `${this.left}px`,
      };
    },
    active() {
      return this.layout.list.active || '';
    },
    preview() {
      return this.layout.preview.show;
    },
  },
  watch: {
    [SIDEBAR_SHOW]() {
      this.changeLeft(true);
    },
    [LIST_SHOW]() {
      this.changeLeft(true);
    },
    [SIDEBAR_WIDTH]() {
      this.changeLeft();
    },
    [LIST_WIDTH]() {
      this.changeLeft();
    },
    active: {
      handler(_id) {
        if (_id) {
          docs.get(_id).then((doc) => {
            this.readyContent(() => {
              if (this.$refs.editor) {
                this.$refs.editor.run(_id, doc.content);
              }
              if (this.$refs.webview) {
                this.$refs.webview.send('content', doc.content);
              }
            });
          });
        }
      },
      immediate: true,
    },
  },
  created() {
    const { sidebar, list } = this.layout;
    const sidebarWidth = sidebar.show ? sidebar.width : 0;
    const listWidth = list.show ? list.width : 0;
    this.left = sidebarWidth + listWidth;
  },
  mounted() {
    this.$refs.webview.addEventListener('dom-ready', () => {
      this.isInitWebview = true;
    });

    this.$parent.$el.addEventListener('workspace:toggle-preview', () => {
      layout.previewToggle();
    });
  },
  methods: {
    changeLeft(isAnimate) {
      if (!this.animationing) {
        const { sidebar, list } = this.layout;
        const sidebarWidth = sidebar.show ? sidebar.width : 0;
        const listWidth = list.show ? list.width : 0;
        if (isAnimate) {
          this.animationing = true;
          this.animation('left', this.left, sidebarWidth + listWidth, () => {
            this.animationing = false;
          });
        } else {
          this.left = sidebarWidth + listWidth;
        }
      }
    },
    readyContent(callback) {
      if (this.isInitWebview) {
        callback();
      } else {
        window.setTimeout(() => {
          this.readyContent(callback);
        }, 10);
      }
    },
    editorChange(value) {
      this.$refs.webview.send('content', value);
      window.clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => {
        docs.update(this.active, value);
      }, 500);
    },
  },
};
</script>

<style lang="less">
imark-workspace .main {
  .container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 3;
    background: #f9f9f9;
    border-left: 1px solid #ddd;


    .content {
      height: 100%;
      width: 100%;
      z-index: 1;
      display: flex;
      overflow: hidden;
      opacity: 0;

      &.open {
        opacity: 1;
      }
    }

    .edit {
      position: relative;
      flex: 1;
      background-color: #fff;

      &.is-preview {
        box-shadow: -10px 2px 6px 10px rgba(0,0,0,0.4);
      }
    }

    .preview {
      position: absolute;
      flex: 1;
      opacity: 0;

      &.show {
        position: relative;
        opacity: 1;
      }

      webview {
        height: 100%;
        width: 100%;
      }
    }

    .placeholder {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }
  }
}
</style>
