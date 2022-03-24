const inquirer = require('inquirer');
const fs = require('fs');
const execa = require('execa');
const chalk = require('chalk');
const ncp = require('ncp');
// const args = require('minimist')(process.argv.slice(2))._;
const util = require('util');
const Listr = require('listr');
const pkgInstall = require('pkg-install');
const path = require('path');
const access = util.promisify(fs.access);
const copy = util.promisify(ncp);
const template = require('../utils/template');

const promptForMissingOptions = async () => {
  const questions = [];
  questions.push({
    type: 'input',
    name: 'name',
    message: '请输入项目名称:',
    validate: (value) => {
      // check the targetDirectory is exist.
      if (fs.existsSync(`${value}`)) {
        return '该目录已经存在';
      }

      return !!value;
    }
  });

  const defaultTemplate = 'umi3';
  // questions.push({
  //   type: 'list',
  //   name: 'template',
  //   message: '请选择模板',
  //   choices: ['umi3', 'vite'],
  //   default: defaultTemplate
  // });

  questions.push({
    type: 'confirm',
    name: 'git',
    message: '需要初始化git？',
    default: false
  });

  const answers = await inquirer.prompt(questions);

  return {
    name: answers.name,
    // current only use umi3
    template: 'umi3',
    // template: answers.template,
    git: answers.git
  };
};

const createDir = (options) => {
  return execa('mkdir', [options.targetDirectory], {
    stdio: 'inherit'
  });
};

const copyTemplateFiles = (options) => {
  // 1. copy default directory
  copy(options.templateDirectory, options.targetDirectory, {
    clobber: false
  });

  // 2. copy core
  const coreDir = path.join(__dirname, `../templates/core`);
  const coreTargetDir = path.join(options.targetDirectory, `core`);
  copy(coreDir, coreTargetDir, {
    clobber: false
  });

  const templateDir = path.join(__dirname, `../templates/other`);
  // 3. copy other
  template.generateAll(
    templateDir,
    {
      name: options.name,
      projectName: template.kebabCase(options.name)
    },
    options.targetDirectory
  );

  return true;
};

const initGit = async (options) => {
  const result = await execa('git', ['init'], {
    cwd: options.targetDirectory
  });

  if (result.failed) {
    return Promise.reject(new Error('初始化git失败'));
  }

  return true;
};

const main = async (options) => {
  const tasks = new Listr(
    [
      {
        title: `创建目录:${options.targetDirectory}`,
        task: () => createDir(options)
      },
      {
        title: '创建模板',
        task: () => copyTemplateFiles(options)
      },
      {
        title: '初始化git',
        task: () => initGit(options),
        enabled: () => options.git
      },
      {
        title: '安装依赖',
        task: () =>
          pkgInstall.projectInstall({
            prefer: 'yarn',
            cwd: options.targetDirectory
          })
      }
    ],
    {
      exitOnError: false
    }
  );

  await tasks.run();
  console.log('%s Project ready', chalk.green.bold('DONE'));
};

const generate = async () => {
  const options = await promptForMissingOptions();
  options.targetDirectory = path.join(process.cwd(), `${options.name}`);
  options.templateDirectory = path.join(__dirname, `../templates/${options.template}`);
  await main(options);
};

module.exports = async () => {
  try {
    await generate();
  } catch (err) {
    console.error('%s ' + err.message, chalk.red.bold('ERROR'));
  }

  process.exit(1);
};
