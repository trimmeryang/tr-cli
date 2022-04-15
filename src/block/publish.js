const chalk = require('chalk');
const _ = require('lodash');
const inquirer = require('inquirer');
const execa = require('execa');
const path = require('path');
const { getGitInfo, getFiles, validateVersion } = require('../utils');
const ejs = require('ejs');
const fs = require('fs-extra');
const dependencyTree = require('./dependencyTree');
const replace = require('replace-in-file');
const { getPackageInfo } = require('./repository');
const { EXTERMAL_BLOCK, TMP_PUBLISH_DIR, SCOPE_NAME, NPM_REGISTRY } = require('./const');

inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'));

const tmpSavingPath = path.join(process.cwd(), TMP_PUBLISH_DIR);
const rootPkg = require(path.join(process.cwd(), 'package.json'));

// 获取目标文件夹的交互命令
const promptForMissingOptions = async () => {
  const { path } = await inquirer.prompt([
    {
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
      message: '选择需要发布的文件夹:',
      default: 'src/components/',
      suggestOnly: false,
      // suggestOnly :: Bool
      // Restrict prompt answer to available choices or use them as suggestions
      depthLimit: 5,
      pageSize: 10
    }
  ]);

  // selectedDir  选中的文件夹名字
  const selectedDir = path.split('/').pop();

  const { name } = await inquirer.prompt({
    type: 'input',
    name: 'name',
    message: '请输入需要发布区块名称:',
    validate: (value) => {
      const kebabCaseValue = _.kebabCase(value);
      if (value !== kebabCaseValue) {
        return `区块名必须为kebabCase, 例: ${kebabCaseValue}`;
      }

      const prevName = selectedDir.split('-').length;
      if (prevName === 1 && kebabCaseValue.split('-').length !== 1) {
        return '名称中不能包好 "-"';
      }

      return !!value;
    }
  });

  const { latest: packageInfo } = await getPackageInfo(name);

  const questions = [];

  questions.push({
    type: 'input',
    name: 'version',
    message: '请输入区块版本:',
    default: packageInfo.version,
    value: packageInfo.version,
    validate: (value) => {
      if (!validateVersion(value)) {
        return '请输入正确的版本号';
      }

      return true;
    }
  });

  questions.push({
    type: 'input',
    name: 'description',
    default: packageInfo.description,
    message: '请输入区块描述信息:',
    validate: (value) => !!value
  });

  const answer = await inquirer.prompt(questions);

  console.log('answer', answer);
  process.exit();
  return {
    path,
    name,
    packageInfo,
    selectedDir,
    ...answer
  };
};

const generateInternalTree = async (options) => {
  // 获取文件夹下的文件
  const allFiles = await getFiles(options.path);
  allFiles.forEach((sourceFile) => {
    const relatePath = sourceFile
      // 保证只替换代码路由下的文件名
      .replace(process.cwd(), '')
      // 替换路径为临时路径
      .replace(options.path, TMP_PUBLISH_DIR)
      // 替换所有的文件名为输入的名字
      .replace(new RegExp(options.selectedDir, 'g'), options.name);
    fs.copySync(sourceFile, path.join(process.cwd(), relatePath));
  });

  return;
};

const generateExternalTree = (externalTree, options) => {
  externalTree.forEach((sourceFile) => {
    const relatePath = sourceFile
      // 把src文件夹下的内容存储到@文件夹下
      .replace(process.cwd(), '')
      .replace('src', `/${EXTERMAL_BLOCK}`)
      // 替换所有的文件名为输入的名字
      .replace(new RegExp(options.selectedDir, 'g'), options.name);
    fs.copySync(sourceFile, `${tmpSavingPath}${relatePath}`);
  });

  return;
};

const generatePkg = async (options, dependencies) => {
  const { name, description, version } = options;
  const author = await getGitInfo('user.email');

  // package.json template
  const pkg = {
    name: `${SCOPE_NAME}/${name}`,
    version: version,
    description: description,
    main: 'index.ts',
    scripts: {
      test: 'echo "Error: no test specified" && exit 1'
    },
    author: author,
    license: 'ISC',
    dependencies: {},
    devDependencies: dependencies
  };

  // 2. add package.json
  const data = ejs.render('<%- JSON.stringify(pkg, null, 2) %>', {
    pkg
  });

  // 3 generate the package.json
  fs.outputFileSync(`${tmpSavingPath}/package.json`, data);
};

// 发布区块
const publishBlock = async () => {
  // 发布区块到仓库
  await execa('npm', ['publish', '--registry', NPM_REGISTRY], {
    cwd: tmpSavingPath,
    stdio: 'inherit'
  });
};

const deleteTempSavingDir = async () => {
  // remove the .tmp
  await execa('rm', ['-rf', tmpSavingPath], {
    stdio: 'inherit'
  });
};

const replaceContents = async (options) => {
  const rootName = rootPkg.name;
  replace.sync({
    files: `${tmpSavingPath}/**/**`,
    from: [
      // 替换tsconfig的 alias 定义
      new RegExp(`@/${rootName}`, 'g'),
      // 替换所选的文件夹名 ==>  输入的文件夹名
      new RegExp(options.selectedDir, 'g'),
      // 转'trTr'
      new RegExp(_.camelCase(options.selectedDir), 'g'),
      // 转'TrTr'
      new RegExp(_.upperFirst(_.camelCase(options.selectedDir)), 'g')
    ],
    to: [EXTERMAL_BLOCK, options.name, _.camelCase(options.name), _.upperFirst(_.camelCase(options.name))]
  });
};

/**
 *
 * @param {*} options
 * 发布区块步骤
 * 1. @todo  登陆区块市场
 */
module.exports = async () => {
  try {
    // step 1 交互命令
    const options = await promptForMissingOptions();

    // step2 清理历史tmp
    await deleteTempSavingDir();
    const sourceDir = path.join(process.cwd(), `${options.path}`);

    // step 3  获取依赖树
    const { dependencies, externalTree } = dependencyTree.getTree(sourceDir);

    // step 4 生成所选文件
    await generateInternalTree(options);

    // step 5 生成外部的tree
    generateExternalTree(externalTree, options);

    // step 6 根据依赖树生成对应的文件，其中包含package.json
    await generatePkg(options, dependencies);

    // step 7 替换文本内容
    await replaceContents(options);

    // step 8 发布区块
    await publishBlock();

    // // step 9 删除tmp
    await deleteTempSavingDir();

    console.log(chalk.green.bold('发布完成'));
  } catch (err) {
    console.error('%s ' + err.message, chalk.red.bold('ERROR'));
    process.exit(1);
  }
};
