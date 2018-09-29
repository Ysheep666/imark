import { remote } from 'electron';
import path from 'path';
import fsExtra from 'fs-extra';
import { imarkFilePrefix } from 'common/core/config';

const mapEditPrefix = (map, editor) => {
  const res = {};
  Object.keys(map).forEach((key) => {
    const variable = map[key];
    res[key] = function prefix() {
      const cursor = editor.getCursor();
      const selection = editor.getSelection();
      if (cursor.ch !== 0) {
        editor.setCursor(cursor.line, 0);
        editor.replaceSelection(`${variable} ${selection}`);
        editor.setCursor(cursor.line, cursor.ch + variable.length + 1);
      } else {
        editor.replaceSelection(`${variable} ${selection}`);
      }
    };
  });
  return res;
};

const mapEditLabel = (map, editor) => {
  const res = {};
  Object.keys(map).forEach((key) => {
    const variable = map[key];
    res[key] = function label() {
      const cursor = editor.getCursor();
      const selection = editor.getSelection();
      editor.replaceSelection(variable + selection + variable);
      if (selection === '') {
        editor.setCursor(cursor.line, cursor.ch + variable.length);
      }
    };
  });
  return res;
};

const mapEditUtils = (editor, that) => ({
  hr() {
    const cursor = editor.getCursor();
    editor.replaceSelection(`${(cursor.ch !== 0) ? '\n\n' : '\n'}------------\n\n`);
  },
  list() {
    const selection = editor.getSelection();
    if (selection === '') {
      editor.replaceSelection(`- ${selection}`);
    } else {
      const selectionText = selection.split('\n');
      for (let i = 0; i < selectionText.length; i += 1) {
        selectionText[i] = (selectionText[i] === '') ? '' : `- ${selectionText[i]}`;
      }
      editor.replaceSelection(selectionText.join('\n'));
    }
  },
  orderedList() {
    const selection = editor.getSelection();
    if (selection === '') {
      editor.replaceSelection(`1. ${selection}`);
    } else {
      const selectionText = selection.split('\n');
      for (let i = 0; i < selectionText.length; i += 1) {
        selectionText[i] = (selectionText[i] === '') ? '' : `${i + 1}. ${selectionText[i]}`;
      }
      editor.replaceSelection(selectionText.join('\n'));
    }
  },
  blockCode() {
    const cursor = editor.getCursor();
    const selection = editor.getSelection();
    editor.replaceSelection(`\`\`\`${selection}\n\`\`\``);
    editor.setCursor(cursor.line, 3);
  },
  link() {
    const cursor = editor.getCursor();
    const selection = editor.getSelection();
    editor.replaceSelection(`[${selection}]()`);
    editor.setCursor(cursor.line, cursor.ch + 3);
  },
  image() {
    const cursor = editor.getCursor();
    const selection = editor.getSelection();
    editor.replaceSelection(`![${selection}]()`);
    editor.setCursor(cursor.line, cursor.ch + 4);
  },
  innertImage() {
    remote.dialog.showOpenDialog({
      filters: [{
        name: 'Images', extensions: ['jpg', 'png', 'gif'],
      }],
      properties: ['openFile'],
    }, (files) => {
      if (files && files.length) {
        files.forEach((f) => {
          const strings = f.split('/');
          const name = strings[strings.length - 1];
          fsExtra.copy(f, path.resolve(that.config.get('base.path'), 'files', that.active, name), (error) => {
            if (!error) {
              const n = name.split('.');
              n.splice(n.length - 1, 1);
              const _name = n.join('.');
              editor.replaceSelection(`![${_name}](${imarkFilePrefix}${that.active}/${f.name})`);
            }
          });
        });
      }
    });
  },
});

const types = ['image/gif', 'image/png', 'image/jpeg'];

export default class Editor {
  constructor(config) {
    this.options = {
      mode: 'gfm',
      autoCloseBrackets: true,
      lineNumbers: false,
      lineWrapping: true,
      indentWithTabs: true,
      matchBrackets: true,
      cursorHeight: 1,
      theme: 'base',
      placeholder: '调整内心，写点东西...',
    };
    this.codeMirror = window.CodeMirror;
    this.config = config;
  }

  render(id, dom) {
    this.active = id;
    this.editor = this.codeMirror.fromTextArea(dom, this.options);
    this.extension();
    return this.editor;
  }

  extension() {
    this.editor.utils = {
      ...mapEditPrefix({
        h1: '#',
        h2: '##',
        h3: '###',
        h4: '####',
        h5: '#####',
        blockquote: '>',
      }, this.editor),
      ...mapEditLabel({
        bold: '**',
        italic: '*',
        strikethrough: '~~',
        code: '`',
      }, this.editor),
      ...mapEditUtils(this.editor, this),
    };

    // 拖拽上传
    this.editor.getWrapperElement().addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        for (let i = 0; i < e.dataTransfer.files.length; i += 1) {
          const f = e.dataTransfer.files[i];
          if (types.indexOf(f.type) !== -1) {
            const imageFile = path.resolve(this.config.get('base.path'), 'files', this.active, f.name);
            fsExtra.copy(f.path, imageFile, (error) => {
              if (!error) {
                const n = f.name.split('.');
                n.splice(n.length - 1, 1);
                const name = n.join('.');
                this.editor.replaceSelection(`![${name}](${imarkFilePrefix}${this.active}/${f.name})`);
              }
            });
          }
        }
      }
    }, false);
  }
}
