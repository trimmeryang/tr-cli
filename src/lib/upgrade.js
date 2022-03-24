const chalk = require('chalk');
const workingDir = require('../utils/workingDir');
const execa = require('execa');
const template = require('../utils/template');
const path = require('path');
const upgradeList = ['core'];

const upgrade = async () => {
  // 1. check is the root directory
  const isRoot = workingDir.isRootDir();
  if (!isRoot) {
    console.error(chalk.red.bold('当前目录不是项目根目录, 请切换到根目录操作!'));
    return false;
  }

  // 2. copy the upgradeList to current working directory
  upgradeList.forEach((list) => {
    // 1. remove target directory
    execa('rm', ['-rf', list], {
      stdio: 'inherit'
    });
    // 2. copy the source
    template.cp(path.join(__dirname, `../templates/${list}`), list);
    return;
  });

  // 3. update other
  const pkjPath = path.join(process.cwd(), `package.json`);
  const pkj = require(pkjPath);
  const name = pkj.name;

  const otherDir = path.join(__dirname, `../templates/other`);
  template.generateAll(
    otherDir,
    {
      name,
      projectName: template.kebabCase(name)
    },
    process.cwd()
  );

  console.log(chalk.green('升级完成'));
};

module.exports = async () => {
  try {
    await upgrade();
  } catch (err) {
    console.error('%s ' + err.message, chalk.red.bold('ERROR'));
    process.exit(1);
  }
};
