const chalk = require('chalk');
const _ = require('lodash');
const inquirer = require('inquirer');
const execa = require('execa');
const { getFiles } = require('../utils');
const { SCOPE_NAME, TMP_INSTALL_DIR, EXTERMAL_BLOCK, NPM_REGISTRY } = require('./const');
const path = require('path');
inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'));
const replace = require('replace-in-file');
const fs = require('fs-extra');

const tmpInstallPath = path.join(process.cwd(), TMP_INSTALL_DIR);
const rootPkg = require(path.join(process.cwd(), 'package.json'));
// 获取文件夹下的文件
const rootName = rootPkg.name;

// 获取目标文件夹的交互命令
const promptForMissingOptions = async () => {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '请输入需要下载的区块名称, 在区块市场的名称, 如@scope/test,只需输入test:',
      validate: (value) => !!value
    }
  ]);

  const questions = [];

  questions.push({
    type: 'input',
    name: 'targetName',
    message: '请输入你需要名称:',
    validate: (value) => {
      const kebabCaseValue = _.kebabCase(value);
      if (value !== kebabCaseValue) {
        return `区块名必须为kebabCase, 例: ${kebabCaseValue}`;
      }

      const prevName = name.split('-').length;
      if (prevName === 1 && kebabCaseValue.split('-').length !== 1) {
        return '名称中不能包好 "-"';
      }

      return !!value;
    }
  });

  questions.push({
    type: 'fuzzypath',
    name: 'path',
    excludePath: (nodePath) => {
      const excludes = ['node_modules', '.idea', '.git', '.history'];
      const excludeReg = new RegExp(`(${excludes.join('|')})[/]??`, 'gi');
      return excludeReg.test(nodePath);
    },
    // excludePath :: (String) -> Bool
    // excludePath to exclude some paths from the file-system scan
    excludeFilter: (nodePath) => nodePath == '.',
    // excludeFilter :: (String) -> Bool
    // excludeFilter to exclude some paths from the final list, e.g. '.'
    itemType: 'directory',
    // itemType :: 'any' | 'directory' | 'file'
    // specify the type of nodes to display
    // default value: 'any'
    // example: itemType: 'file' - hides directories from the item list
    rootPath: './',
    // rootPath :: String
    // Root search directory
    message: '选择区块安装的文件夹:',
    default: 'src/components/',
    suggestOnly: false,
    // suggestOnly :: Bool
    // Restrict prompt answer to available choices or use them as suggestions
    depthLimit: 5,
    pageSize: 10
  });

  const anotherAnswer = await inquirer.prompt(questions);

  return {
    name,
    ...anotherAnswer
  };
};

// 从区块市场获取所有的区块
const getAllBlocks = async () => {
  return true;
};

// 安装区块到目标文件夹
// @todo 先使用简单方式安装，后续进行优化
const downloadBlock = async (name) => {
  // only download the production dependencies
  await execa(
    'npm',
    ['install', '--only=prod', `${SCOPE_NAME}/${name}`, '--prefix', tmpInstallPath, '--registry', NPM_REGISTRY],
    {
      stdio: 'inherit'
    }
  );
};

const deleteTempSavingDir = async () => {
  // remove the .tmp
  await execa('rm', ['-rf', tmpInstallPath], {
    stdio: 'inherit'
  });
};

const isIgnoreFile = (filePath) => {
  const ignorePath = ['package.json', 'public', 'docs'];
  return ignorePath.some((i) => filePath.includes(i));
};

const writeContent = async (args) => {
  const { sourceFile, tmpPath, options, targetDir } = args;
  const dirPath = sourceFile.substring(0, tmpPath.length).replace(tmpPath, path.join(targetDir, options.targetName));
  const filePath = sourceFile
    .substring(tmpPath.length)
    // 替换所有的文件名为输入的名字,  options.name为区块名， options.targetName 为目标文件夹名
    .replace(new RegExp(options.name, 'g'), options.targetName);

  const targetFilePath = `${dirPath}${filePath}`;
  fs.copySync(sourceFile, targetFilePath);

  // 剔除不需要替换文本的文件
  if (isIgnoreFile(filePath)) {
    return;
  }

  // 替换文本
  replace.sync({
    files: targetFilePath,
    from: [
      // 替换tsconfig的 alias 定义
      new RegExp(EXTERMAL_BLOCK, 'g'),
      // 替换所选的文件夹名 ==>  输入的文件夹名
      new RegExp(options.name, 'g'),
      // 转'trTr'
      new RegExp(_.camelCase(options.name), 'g'),
      // 转'TrTr'
      new RegExp(_.upperFirst(_.camelCase(options.name)), 'g')
    ],
    to: [
      `@/${rootName}`,
      options.targetName,
      _.camelCase(options.targetName),
      _.upperFirst(_.camelCase(options.targetName))
    ]
  });

  return;
};

const installBlock = async (options, targetDir) => {
  const tmpPath = `${tmpInstallPath}/node_modules/${SCOPE_NAME}/${options.name}`;
  const allFiles = await getFiles(tmpPath);

  allFiles.forEach((sourceFile) => {
    /** @todo 安装外部依赖， 牵扯到文件合并逻辑，比较繁琐 */
    // if (sourceFile.includes('@/external-blocks')) {
    //   return;
    // }

    // 写入区块
    writeContent({ sourceFile, tmpPath, options, targetDir });
  });
};

/**
 *
 * @param {*} options
 * 安装区块步骤
 * 1. @todo  登陆区块市场，选择所需的区块
 * 2. 选择安装的目标文件夹， targetDir
 * 3. 安装到目标文件夹
 */
module.exports = async () => {
  try {
    // step 1 交互
    const options = await promptForMissingOptions();

    // step2 清理历史残留
    await deleteTempSavingDir();
    const targetDir = path.join(process.cwd(), `${options.path}`);

    // step3 下载区块
    await downloadBlock(options.name);

    // step4 安装区块
    await installBlock(options, targetDir);

    // step 5 删除tmp
    await deleteTempSavingDir();

    console.log(chalk.green.bold('安装完成'));
  } catch (err) {
    console.error('%s ' + err.message, chalk.red.bold('ERROR'));
    process.exit(1);
  }
};
