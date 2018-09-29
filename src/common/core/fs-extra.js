import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';

export const accessPath = (pathname) => {
  try {
    fs.accessSync(pathname);
    return true;
  } catch (e) {
    return false;
  }
};

// 设置 metadata 信息
export const init = (rootPath) => {
  const folderFile = path.join(rootPath, 'folders.db');
  const docFile = path.join(rootPath, 'docs.db');

  return Promise.all([
    fsExtra.outputFile(folderFile, ''),
    fsExtra.outputFile(docFile, ''),
  ]);
};

// 验证 database 是否存在
export const access = rootPath => accessPath(path.join(rootPath, 'folders.db')) && accessPath(path.join(rootPath, 'docs.db'));
