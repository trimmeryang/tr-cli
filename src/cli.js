const program = require('commander');
const leven = require('leven');
const chalk = require('chalk');
const semver = require('semver');
const execSync = require('child_process').execSync;

const minYarnPnp = '1.12.0';
const maxYarnPnp = '4.0.0';

/**
 * check the yarn version is the range of minYarnPnp and maxYarnPnp
 * @returns
 */
const isValidateYarn = () => {
  try {
    const yarnVersion = execSync('yarnpkg --version').toString().trim();
    return semver.gte(yarnVersion, minYarnPnp) && semver.lt(yarnVersion, maxYarnPnp);
  } catch (e) {
    console.log(chalk.red(`请先安装版本yarn!`));
  }

  return false;
};

process.on('unhandledRejection', (error) => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});

const suggestCommands = (unknownCommand) => {
  const availableCommands = program.commands.map((cmd) => cmd._name);

  let suggestion;

  availableCommands.forEach((cmd) => {
    const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand);
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd;
    }
  });

  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`));
  }
};

program.version(`tr-cli ${require('../package.json').version}`);

program
  .command('generate')
  .alias('g')
  .option('-p, --project', '生成项目')
  .option('-c, --component', '生成组件')
  .option('-pg, --page', '生成页面')
  .option('-h, --hook', '生成hook')
  .description('生成项目|组件|页面')
  .action((options) => {
    require('./lib/generate')(options);
  });

program
  .command('start')
  .alias('s')
  .description('启动项目')
  .action((options) => {
    require('./lib/start')(options);
  });

program
  .command('build')
  .alias('b')
  .description('build项目')
  .action((options) => {
    require('./lib/build')(options);
  });

program
  .command('upgrade')
  .alias('u')
  .description('更新项目')
  .action((options) => {
    require('./lib/upgrade')();
  });

program
  .command('info')
  .description('打印你的系统信息')
  .action((cmd) => {
    console.log(chalk.bold('\n系统信息:'));
    require('envinfo')
      .run(
        {
          System: ['OS', 'CPU'],
          Binaries: ['Node', 'Yarn', 'npm'],
          Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
          npmPackages: '/**/{typescript,*tr-cli*}',
          npmGlobalPackages: ['tr-cli']
        },
        {
          showNotFound: true,
          duplicates: true,
          fullTree: true
        }
      )
      .then(console.log);
  });

program.on('command:*', ([cmd]) => {
  program.outputHelp();
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
  console.log();
  suggestCommands(cmd);
  process.exitCode = 1;
});

program.on('--help', () => {
  console.log();
  console.log(chalk.green('欢迎使用tr-cli'));
  console.log();
  console.log(chalk.green('如有问题，请联系yanghuan.a@miaozhen.com'));
});

module.exports = async () => {
  if (!isValidateYarn()) {
    return console.log(chalk.red(`请安装以下版本yarn: ${minYarnPnp} ~ ${maxYarnPnp}`));
  }

  program.parse(process.argv);
};
