const execa = require('execa');
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const chalk = require('chalk');
const { NPM_REGISTRY, SCOPE_NAME } = require('./const');
const inquirer = require('inquirer');
const npmLogin = require('npm-cli-login');

const isLogin = async () => {
  try {
    const { stdout } = await execa('npm', ['whoami', `--registry=${NPM_REGISTRY}`]);
    return stdout;
  } catch (e) {
    console.warn(chalk.yellow.bold('登陆失败，需要重新登陆！'));
  }

  return false;
};
const promptForMissingOptions = async () => {
  const questions = [];

  questions.push({
    type: 'input',
    name: 'name',
    message: '请输入用户名:',
    validate: (value) => !!value
  });

  questions.push({
    type: 'input',
    name: 'email',
    message: '请输入邮箱:',
    validate: (value) =>
      /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
        value
      ) || '请输入正确的邮箱!'
  });

  questions.push({
    type: 'password',
    name: 'password',
    message: '请输入密码:',
    validate: (value) => !!value
  });

  return await inquirer.prompt(questions);
};

const login = async () => {
  //step 1 交互命令
  const { name, email, password } = await promptForMissingOptions();
  // 开始登陆
  try {
    return await npmLogin(
      name,
      password,
      email,
      NPM_REGISTRY,
      SCOPE_NAME
      // false,
      // path.join(process.cwd(), '.npmrc')
    );
  } catch (e) {
    throw new Error(`登陆失败: ${e.message}`);
  }
};

const doLogin = async () => {
  // step 1 check login
  const res = await isLogin();

  if (!res) {
    await login();
  }

  return true;
};

module.exports = {
  isLogin,
  doLogin
};
