const chalk = require('chalk');
const workingDir = require('../utils/workingDir');
const constant = require('../utils/constant');
const template = require('../utils/template');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const promptForMissingOptions = async (type) => {
  const questions = [];
  questions.push({
    type: 'input',
    name: 'name',
    message: `请输入${constant.info[type]}名称:`,
    validate: (value) => {
      // check the targetDirectory is exist.
      const tmpDir = `${type}Dir`;
      if (fs.existsSync(`${constant[tmpDir]}/${value}`)) {
        return '该目录已经存在';
      }

      return !!value;
    }
  });

  const answers = await inquirer.prompt(questions);

  return {
    name: answers.name
  };
};

const generate = async (type) => {
  console.log(chalk.green.bold(`开始生成${constant.info[type]}`));
  // 1. check whether the project is in the current working directory
  const isRoot = workingDir.isRootDir();
  if (!isRoot) {
    console.error(chalk.red.bold('当前目录不是项目根目录, 请切换到根目录操作!'));
    return false;
  }

  // 2. questions and answers of the generate command
  const options = await promptForMissingOptions(type);

  // 3. generate the component to the current working directory
  let templateDir = path.join(__dirname, `../templates/${type}`);
  if (!fs.existsSync(templateDir)) {
    templateDir = path.join(__dirname, `../templates/component`);
  }

  template.generate(templateDir, options.name, type);

  console.log(chalk.green.bold(`生成${constant.info[type]}完成`));
};

module.exports = async (type) => {
  try {
    await generate(type);
  } catch (err) {
    console.error('%s ' + err.message, chalk.red.bold('ERROR'));
    process.exit(1);
  }
};
