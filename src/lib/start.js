const chalk = require('chalk');
const workingDir = require('../utils/workingDir');
const execa = require('execa');
const start = async () => {
  // 1. check is the root directory
  const isRoot = workingDir.isRootDir();
  if (!isRoot) {
    console.error(chalk.red.bold('当前目录不是项目根目录, 请切换到根目录操作!'));
    return false;
  }

  // 2. generate the config

  // 3. exec the start command
  execa(`./node_modules/.bin/cross-env`, ['UMI_ENV=dev', './node_modules/.bin/umi', 'dev'], {
    stdio: 'inherit'
  });
};

module.exports = async (options) => {
  try {
    await start();
  } catch (err) {
    console.error('%s ' + err.message, chalk.red.bold('ERROR'));
    process.exit(1);
  }
};
