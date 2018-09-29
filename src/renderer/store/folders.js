/**
 * metadata 信息
 */
import _ from 'lodash';
import createDatabase from 'common/core/database';

export default {
  state: {
    rootPath: '',
    items: [],
  },
  initialize(path) {
    this.state.rootPath = path;
    this.db = createDatabase(`${this.state.rootPath}/folders.db`);

    return this.db.find().then((folders) => {
      this.state.items = folders;
      return Promise.resolve();
    });
  },
  create(name) {
    return this.db.insert({ name }).then((folder) => {
      this.state.items.push(folder);
      return folder;
    });
  },
  rename(_id, name) {
    return this.db.update({ _id }, { $set: { name } }).then(() => {
      const index = _.findIndex(this.state.items, { _id });
      this.state.items[index].name = name;
      return Promise.resolve();
    });
  },
  delete(_id) {
    return this.db.delete({ _id }).then(() => {
      const index = _.findIndex(this.state.items, { _id });
      this.state.items.splice(index, 1);
      return Promise.resolve();
    });
  },
};
