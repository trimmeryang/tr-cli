const ejs = require('ejs');
const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const constant = require('./constant');
const util = require('util');
const ncp = require('ncp');
const access = util.promisify(fs.access);
const copy = util.promisify(ncp);

const render = (templatePath, params, targetPath) => {
  // 1. read the template file
  const template = fs.readFileSync(templatePath, 'utf-8');
  // 2. use ejs to compile the template
  const data = ejs.render(template, params);
  // 3 copy file to targetPath
  fs.outputFileSync(targetPath, data);
  return true;
};

const generate = (templateDir, name, type) => {
  // 1. list all files
  const templateFiles = fs.readdirSync(templateDir);

  const targetDir = constant[`${type}Dir`];

  const params = {
    className: _.upperFirst(_.camelCase(name)),
    fileName: name
  };

  // 2 loop to write the template to target directory
  templateFiles.forEach((templateFile) => {
    const targetFile = ejs.render(templateFile, params);
    const templatePath = `${templateDir}/${templateFile}`;
    const targetPath = path.join(process.cwd(), `${targetDir}/${name}/${targetFile}`);
    render(templatePath, params, targetPath);
  });
};

const generateAll = (templateDir, params, targetPath) => {
  // 1. list all files
  const templateFiles = fs.readdirSync(templateDir);
  templateFiles.forEach((filePath) => {
    let tmpTargetPath = targetPath;
    tmpTargetPath = path.join(tmpTargetPath, filePath);
    // check path is directory
    if (fs.statSync(`${templateDir}/${filePath}`).isDirectory()) {
      generateAll(`${templateDir}/${filePath}`, params, tmpTargetPath);
      return false;
    }

    const targetFile = ejs.render(filePath, params);
    const templatePath = `${templateDir}/${targetFile}`;
    render(templatePath, params, tmpTargetPath);
  });
};

/**
 * copy the files from sourcePath to targetPath
 * @param {*} sourcePath
 * @param {*} targetPath
 * @returns
 */
const cp = (sourcePath, targetPath) => {
  return copy(sourcePath, targetPath, {
    clobber: false
  });
};

const kebabCase = (str) => _.trim(str.replace(/([A-Z])/g, '-$1').toLowerCase(), '-');

module.exports = {
  generate,
  generateAll,
  render,
  cp,
  kebabCase
};
