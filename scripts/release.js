const inquirer = require('inquirer');
const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const execa = require('execa');

const promptForMissingOptions = async () => {
    const questions = [];
    questions.push({
        type: 'input',
        name: 'version',
        message: `请输入最新版本(x.y.z):`,
        validate: (value) => {
            return !!value;
        }
    });

    const answers = await inquirer.prompt(questions);

    const version = answers.version;

    let newVersion = answers.version.split('.');
    let [x, y, z, w] = newVersion;
    if (!z || w) {
        console.log(chalk.red.bold(`当前输入的version为${version}， 不符合x.y.z的命名规则`));
        process.exit(1);
    }

    return {
        version: version
    };
};

const release = async () => {
    const currentVersion = require('../package.json').version;
    console.log(`当前package的version: ${currentVersion}`);

    // 1. 删除本地的tag，为了防止远程的tag删除而本地没删除
    // git tag -l | xargs git tag -d #删除所有本地分支
    // git fetch origin --prune #从远程拉取所有信息

    const tagList = (await execa('git', ['tag', '-l'])).stdout.split('\n');
    tagList.forEach((tag) => {
        execa('git', ['tag', '-d', tag]);
    });

    // 2. 保持和远程tag一致
    await execa('git', ['fetch', 'origin', '--prune']);

    // 获取最后一个tag版本
    const lastTag = await execa('git', ['describe', '--tags']);
    // `git rev-list --tags --max-count=1`]);

    // 去掉v
    const localTag = lastTag.stdout.split('-')[0].slice(1, 20);
    console.log(`当前最新的tag: v${localTag}`);

    const options = await promptForMissingOptions();

    if (options.version < localTag) {
        return Promise.reject(new Error('版本低于已有版本'));
    }

    let package = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    package = Object.assign({ ...package, version: options.version });

    // 更新readMe
    const readMe = fs.readFileSync('README.md', 'utf-8');
    await fs.writeFile(path.resolve('README.md'), readMe.replace(localTag, options.version), 'utf8', err => {
        if (err) throw err;
        console.log(chalk.green.bold(`已更新readMe`));
    })

    // 重新写入package.json
    await fs.writeFile(path.resolve('package.json'), JSON.stringify(package, null, 2), 'utf8', err => {
        if (err) throw err;
        console.log(chalk.green.bold(`已生成新的package.json`));
    })

    await execa('git', ['add', '-A'], { stdio: 'inherit' });
    await execa('git', ['commit', '-m', 'update cli'], { stdio: 'inherit' });

    // git push --set-upstream origin deploy
    await execa('git', ['push']);
    await execa('git', ['tag', `v${options.version}`]);
    await execa('git', ['push', 'origin', `v${options.version}`]);
    console.log(chalk.green.bold('提交成功'));
}

release().catch(err => {
    console.error(err);
    process.exit(1);
})