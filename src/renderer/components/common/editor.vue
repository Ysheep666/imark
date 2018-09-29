<template>
  <div id="editor" class="editor"></div>
</template>

<script>
export default {
  name: 'editor',
  data() {
    return {
      content: '',
    };
  },
  mounted() {
    const action = functionName => () => {
      if (this.editor) {
        this.editor.utils[functionName]();
      }
    };

    this.$el.addEventListener('workspace:format-h1', action('h1'));
    this.$el.addEventListener('workspace:format-h2', action('h2'));
    this.$el.addEventListener('workspace:format-h3', action('h3'));
    this.$el.addEventListener('workspace:format-h4', action('h4'));
    this.$el.addEventListener('workspace:format-h5', action('h5'));
    this.$el.addEventListener('workspace:format-hr', action('h5'));
    this.$el.addEventListener('workspace:format-bold', action('bold'));
    this.$el.addEventListener('workspace:format-italic', action('italic'));
    this.$el.addEventListener('workspace:format-strikethrough', action('strikethrough'));
    this.$el.addEventListener('workspace:format-list', action('list'));
    this.$el.addEventListener('workspace:format-ordered-list', action('orderedList'));
    this.$el.addEventListener('workspace:format-blockquote', action('blockquote'));
    this.$el.addEventListener('workspace:format-code', action('code'));
    this.$el.addEventListener('workspace:format-block-code', action('blockCode'));
    this.$el.addEventListener('workspace:format-link', action('link'));
    this.$el.addEventListener('workspace:format-image', action('image'));
    this.$el.addEventListener('workspace:format-innert-image', action('innertImage'));
  },
  methods: {
    run(id, value) {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = value;
      this.$el.innerHTML = '';
      this.$el.appendChild(textarea);
      this.$nextTick(() => {
        this.editor = __application.editor.render(id, textarea);
        this.editor.on('beforeChange', (editor, change) => {
          // 去除不可识别的空格字符
          if (change.text && change.text.length) {
            for (let i = 0; i < change.text.length; i += 1) {
              if (change.text[i].charCodeAt(0) === 8) {
                change.text[i] = '';
              }
            }
          }
        });
        this.editor.on('change', (editor) => {
          this.$emit('change', editor.getValue());
        });
      });
    },
  },
};
</script>

<style lang="less">
.editor {
  height: 100%;
  width: 100%;
  z-index: 1;
  display: flex;
  overflow: hidden;
}

.CodeMirror {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: auto;
  height: auto;
  line-height: 2.1;
}

.CodeMirror-cursor {
  border-left: none;

  &:before {
    content: '';
    display: block;
    position: absolute;
    top: 10%;
    bottom: 20%;
    border-left: 2px solid #000;
  }
}

.CodeMirror-scroll {
  max-width: 650px;
  padding: 30px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    display: none;
  }
}

.CodeMirror-sizer {
  border-right: none;
}

.CodeMirror-placeholder {
  opacity: .3;
}

.CodeMirror-gutters {
  border-right: none;
  background: transparent;
}

.cm-s-base {
  div.CodeMirror-selected {
    background: #e0e0e0;
  }

  .CodeMirror-line::selection, .cm-s-base16-light .CodeMirror-line > span::selection, .cm-s-base16-light .CodeMirror-line > span > span::selection {
    background: #e0e0e0;
  }

  .CodeMirror-line::-moz-selection, .cm-s-base16-light .CodeMirror-line > span::-moz-selection, .cm-s-base16-light .CodeMirror-line > span > span::-moz-selection {
    background: #e0e0e0;
  }

  .cm-header-1 { font-size: 2em; }
  .cm-header-2 { font-size: 1.75em; }
  .cm-header-3 { font-size: 1.5em; }
  .cm-header-4 { font-size: 1.3em; }
  .cm-header-5 { font-size: 1.2em; }
  .cm-header-6 { font-size: 1.15em; }
  .cm-quote { color: #90a959; font-style: italic; }
}

.cm-s-base.CodeMirror{color: #333;}
.cm-s-base div.CodeMirror-selected{background: #e0e0e0;}
.cm-s-base .CodeMirror-line::selection, .cm-s-base .CodeMirror-line > span::selection, .cm-s-base .CodeMirror-line > span > span::selection{background: #e0e0e0;}
.cm-s-base .CodeMirror-line::-moz-selection, .cm-s-base .CodeMirror-line > span::-moz-selection, .cm-s-base .CodeMirror-line > span > span::-moz-selection{background: #e0e0e0;}
.cm-s-base .CodeMirror-guttermarker{color: #ac4142;}
.cm-s-base .CodeMirror-guttermarker-subtle{color: #b0b0b0;}
.cm-s-base .CodeMirror-linenumber{color: #b0b0b0;}
.cm-s-base .CodeMirror-cursor:before{border-left-color: #505050;}
.cm-s-base span.cm-comment{color: #8f5536;}
.cm-s-base span.cm-atom{color: #aa759f;}
.cm-s-base span.cm-number{color: #aa759f;}
.cm-s-base span.cm-property, .cm-s-base span.cm-attribute{color: #90a959;}
.cm-s-base span.cm-keyword{color: #ac4142;}
.cm-s-base span.cm-string{color: #f4bf75;}
.cm-s-base span.cm-variable{color: #90a959;}
.cm-s-base span.cm-variable-2{color: #6a9fb5;}
.cm-s-base span.cm-def{color: #d28445;}
.cm-s-base span.cm-bracket{color: #202020;}
.cm-s-base span.cm-tag{color: #ac4142;}
.cm-s-base span.cm-link{color: #aa759f;}
.cm-s-base span.cm-error{background: #ac4142; color: #505050;}
.cm-s-base .CodeMirror-activeline-background{background: #DDDCDC;}
.cm-s-base .CodeMirror-matchingbracket{text-decoration: underline; color: white !important;}
</style>
