const chalk = require('chalk');
const _ = require('lodash');
const workingDir = require('../utils/workingDir');
const { doLogin } = require('./npmUser');

module.exports = async (options) => {
  const isRoot = workingDir.isRootDir();
  if (!isRoot) {
    console.error(chalk.red.bold('当前目录不是项目根目录, 请切换到根目录操作!'));
    return false;
  }

  try {
    await doLogin();

    if (options.install) {
      return require('./install')();
    }

    if (options.publish) {
      return require('./publish')();
    }

    console.error('%s 请选择一个参数:', chalk.red.bold('ERROR'));
    console.log('  %s: 安装区块', chalk.green.bold('-install'));
    console.log('  %s: 发布区块', chalk.green.bold('-public'));
    console.log('  %s: 登陆区块市场', chalk.green.bold('-login'));
  } catch (err) {
    console.error('%s ' + err.message, chalk.red.bold('ERROR'));
    process.exit(1);
  }
};
