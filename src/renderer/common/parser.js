import path from 'path';
import crypto from 'crypto';
import marked from 'marked';
import highlight from 'highlight.js';
import { imarkFilePrefix } from 'common/core/config';

const md5 = (value) => {
  const hash = crypto.createHash('md5');
  hash.update(value);
  return hash.digest('hex');
};

export default class Parser {
  constructor(config) {
    this.marked = marked;
    this.highlight = highlight;
    this.config = config;
    this.marked.renderer = new marked.Renderer();
  }

  initialize() {
    this.marked.renderer.heading = (text, level) => {
      const hash = md5(`${text}h${level}`);
      const toc = {
        text, level, hash,
      };
      if (this.marked.tocs) {
        this.marked.tocs.push(toc);
      }
      return `
        <h${level} id="h${level}-${hash}">
          <a name="${hash}" class="anchor"><span class="header-link"></span></a>
          ${text}
        </h${level}>
      `;
    };

    this.marked.renderer.imarkFile = (href) => {
      if (href.indexOf(imarkFilePrefix) === 0) {
        return path.resolve(this.config.get('base.path'), 'files', href.substr(imarkFilePrefix.length));
      }
      return href;
    };

    this.marked.renderer.image = (href, title, text) => {
      const exec = /\s=\s*(\d*)\s*x\s*(\d*)\s*$/.exec(href);
      if (exec && exec[0]) href = href.replace(exec[0], '');
      href = this.marked.renderer.imarkFile(href);
      let out = `<img src="${href}" alt="${text}`;
      if (title) out += `" title="${title}`;
      if (exec && exec[1]) out += `" height="${exec[1]}`;
      if (exec && exec[2]) out += `" width="${exec[2]}`;
      return `${out}">`;
    };

    this.initOptions();
  }

  initOptions() {
    this.marked.setOptions({
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      renderer: this.marked.renderer,
      highlight: code => this.highlight.highlightAuto(code).value,
    });
  }

  getTitle(value) {
    const tokens = this.marked.lexer(value);
    const heading = tokens.find(token => token.type === 'heading' && token.depth === 1);
    return heading ? heading.text : '';
  }

  getTocs(value) {
    this.marked.tocs = [];
    this.marked(value);
    return this.marked.tocs;
  }

  getHtml(value) {
    this.marked.tocs = [];
    const content = this.marked(value);
    let tocs = '<ul class="toc-list">';
    let lastLevel = 0;
    tocs += this.marked.tocs.reduce((content, toc) => {
      if (toc.level < 2) {
        return content;
      }

      if (toc.level > lastLevel) {
        content += '';
      } else if (toc.level < lastLevel) {
        content += (new Array((lastLevel - toc.level) + 2)).join('</ul></li>');
      } else {
        content += '</ul></li>';
      }
      lastLevel = toc.level;
      return `${content}<li><a class="toc-level-${toc.level}" href="#h${toc.level}-${toc.hash}">${toc.text}</a><ul>`;
    }, '');
    tocs += '</li></ul>';
    console.log(tocs);
    return content.replace(/\[TOC\]/ig, tocs);
  }
}
