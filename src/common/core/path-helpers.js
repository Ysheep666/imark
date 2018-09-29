import fs from 'fs-extra';
import path from 'path';

export const initDot = (homePath) => {
  process.env.APPLICATION_HOME = path.join(homePath, '.imark');
  if (!fs.pathExistsSync(process.env.APPLICATION_HOME)) {
    const templateConfigDirPath = path.join(process.env.STATIC_PATH, 'dot-imark');
    fs.copySync(templateConfigDirPath, process.env.APPLICATION_HOME);
  }
};

export default {
  initDot,
};
