const execa = require('execa');
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

const getGitInfo = async (type) => {
  const { stdout } = await execa('git', ['config', type]);
  return stdout;
};

/**
 *
 * 获取指定文件夹下所有的文件
 * @param {*} dir
 * @returns
 */
const getFiles = async function (dir) {
  const dirs = await fs.readdirSync(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirs.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );
  return files.flat();
};

/**
 *
 * 判断是不是有效的package version
 * @param {*} version
 * @param {*} extended
 * @returns
 */
const validateVersion = (version) => {
  const v = version.split('.');

  if (v.length !== 3) return false;

  return v.every((i) => i && !isNaN(i));
};
module.exports = {
  getGitInfo,
  getFiles,
  validateVersion
};
