const chalk = require('chalk');
const _ = require('lodash');

module.exports = async (options) => {
  try {
    if (options.project) {
      return require('./generateProject')();
    }

    const type = Object.keys(options)[0];
    if (type) {
      return require('./generateBuilder')(type);
    }

    console.error('%s 请选择一个参数:', chalk.red.bold('ERROR'));
    console.log('  %s: 生成项目', chalk.green.bold('-p'));
    console.log('  %s: 生成组件', chalk.green.bold('-c'));
    console.log('  %s: 生成页面', chalk.green.bold('-pg'));
    console.log('  %s: 生成hook', chalk.green.bold('-h'));
  } catch (err) {
    console.error('%s ' + err.message, chalk.red.bold('ERROR'));
    process.exit(1);
  }
};
