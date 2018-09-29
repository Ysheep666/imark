/**
 * metadata 信息
 */
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import dateFns from 'date-fns';
import fsExtra from 'fs-extra';
import createDatabase from 'common/core/database';
import layout from './layout';

export default {
  state: {
    rootPath: '',
    items: [],
  },
  initialize(path) {
    this.state.rootPath = path;
    this.db = createDatabase(`${this.state.rootPath}/docs.db`);
    return this.check();
  },
  check() {
    const sidebarActive = layout.state.sidebar.active;
    let query = {};
    if (sidebarActive === 'schedule') {
      query = { updatedAt: { $gt: dateFns.addDays(new Date(), -7) } };
    } else if (sidebarActive === 'unclassified') {
      query = { folderId: { $exists: false } };
    } else if (sidebarActive === 'trash') {
      query = { deleted: true };
    } else if (sidebarActive.indexOf('folder') === 0) {
      const folderId = sidebarActive.substr(7);
      query = { folderId };
    }
    return this.db.find(query).then((docs) => {
      this.state.items = docs;
      return Promise.resolve();
    });
  },
  create() {
    const doc = {
      name: '未命名',
      summary: '调整内心，写点东西吧！',
    };

    const sidebarActive = layout.state.sidebar.active;
    if (sidebarActive.indexOf('folder') !== -1) {
      const folderId = sidebarActive.substr(7);
      doc.folderId = folderId;
    }

    return this.db.insert(doc)
      .then(doc => fsExtra.outputFile(path.join(this.state.rootPath, `${doc._id}.md`), '').then(() => doc))
      .then((doc) => {
        this.state.items.push(doc);
        return doc;
      });
  },
  get(_id) {
    return this.db.get(_id).then((doc) => {
      doc.content = fs.readFileSync(path.join(this.state.rootPath, `${_id}.md`), 'utf-8');
      return doc;
    });
  },
  update(_id, content) {
    const name = __application.parser.getTitle(content) || '未命名';
    const summary = content.length > 120 ? `${content.substring(0, 120)}...` : content;
    return Promise.all([
      this.db.update({ _id }, { $set: { name, summary } }),
      fsExtra.outputFile(path.join(this.state.rootPath, `${_id}.md`), content),
    ]).then(() => {
      const index = _.findIndex(this.state.items, { _id });
      this.state.items[index].name = name;
      this.state.items[index].summary = summary;
      return Promise.resolve();
    });
  },
  trash(_id, undo = false) {
    return this.db.trash({ _id }, undo).then(() => {
      const isTrash = layout.state.sidebar.active === 'trash';
      if (isTrash === !undo) {
        return this.db.get(_id).then((doc) => {
          this.state.items.push(doc);
        });
      }
      const index = _.findIndex(this.state.items, { _id });
      this.state.items.splice(index, 1);
      return Promise.resolve();
    });
  },
  delete(_id) {
    return Promise.all([
      this.db.delete({ _id }),
      fsExtra.remove(path.join(this.state.rootPath, `${_id}.md`)),
    ]).then(() => {
      const index = _.findIndex(this.state.items, { _id });
      this.state.items.splice(index, 1);
      return Promise.resolve();
    });
  },
};
