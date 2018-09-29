import Nedb from 'nedb';

const promisify = callback => new Promise((resolve, reject) => callback((error, result) => {
  if (error) {
    reject(error);
  } else {
    resolve(result);
  }
}));

export default (filename) => {
  const db = {};
  db.database = new Nedb({
    filename,
    timestampData: true,
    autoload: true,
  });


  db.insert = doc => new Promise((resolve, reject) => {
    db.database.insert(Object.assign({}, doc, {
      deleted: false,
    }), (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  db.update = (query, update) => new Promise((resolve, reject) => {
    db.database.update(query, update, { multi: true }, (error, numReplaced) => {
      if (error) {
        reject(error);
      } else {
        resolve(numReplaced);
      }
    });
  });

  db.trash = (query, undo) => db.update(query, {
    $set: {
      deleted: !undo,
    },
  });

  db.delete = query => new Promise((resolve, reject) => {
    db.database.remove(query, { multi: true }, (error, numRemoved) => {
      if (error) {
        reject(error);
      } else {
        resolve(numRemoved);
      }
    });
  });

  db.find = (query, projection) => {
    const cursor = db.database.find(Object.assign({}, { deleted: false }, query), projection);
    return promisify(cursor.exec.bind(cursor));
  };

  db.get = (_id) => {
    const cursor = db.database.findOne({ _id });
    return promisify(cursor.exec.bind(cursor));
  };

  return db;
};
